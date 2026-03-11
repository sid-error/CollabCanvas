/**
 * @fileoverview Socket.io handler for real-time room collaboration, drawing, and moderation.
 * Merged from two implementation versions — preserves high-performance memory state,
 * LWW conflict resolution, full chat persistence, and backward-compatible lock events.
 */

const mongoose = require("mongoose");
const Room = require("../models/Room");
const Participant = require("../models/Participant");
const CanvasVersion = require("../models/CanvasVersion");
const Message = require("../models/Message");
const { createNotification } = require("../controllers/notificationController");
const { sendNotificationViaSocket } = require("./notificationSocket");
const { decompressDrawingData } = require("../utils/payloadDecompression");

// ─────────────────────────────────────────────────────────────────────────────
// Shared In-Memory State & Constants
// ─────────────────────────────────────────────────────────────────────────────

/** { roomId: { elementId: { userId, socketId, username, color, timestamp } } } */
const roomLocks = new Map();

/** { roomId: [DrawingElement] } — authoritative canvas state */
const activeRooms = new Map();

/** { roomId: { elementId: { timestamp, version } } } — for LWW conflict resolution */
const elementVersions = new Map();

/** Rooms with un-persisted changes */
const pendingSaves = new Set();

const LOCK_TIMEOUT = 30_000; // 30 seconds
const FLUSH_INTERVAL = 5_000; // 5 seconds

/** Module-level io reference populated on first handler call */
let globalIo = null;

// ─────────────────────────────────────────────────────────────────────────────
// Background Tasks (module-level — started once, not per-socket)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stale lock sweeper — runs every 10 s.
 * Force-unlocks any lock older than LOCK_TIMEOUT so idle/crashed clients
 * don't permanently hold elements.
 */
setInterval(() => {
  const now = Date.now();
  roomLocks.forEach((locks, roomId) => {
    Object.keys(locks).forEach((elementId) => {
      if (now - locks[elementId].timestamp > LOCK_TIMEOUT) {
        delete locks[elementId];
        if (globalIo) {
          globalIo.to(roomId).emit("force-unlock", { elementId, reason: "timeout" });
          globalIo.to(roomId).emit("object-unlocked", { elementId, reason: "timeout" });
        }
      }
    });
  });
}, 10_000);

/**
 * Authoritative state flusher — persists memory state to MongoDB every 5 s.
 */
setInterval(async () => {
  for (const roomId of pendingSaves) {
    const elements = activeRooms.get(roomId);
    try {
      await Room.findByIdAndUpdate(roomId, {
        drawingData: elements || [],
        updatedAt: new Date(),
      });
      pendingSaves.delete(roomId);
    } catch (err) {
      console.error(`Failed to flush memory state for room ${roomId}:`, err);
    }
  }
}, FLUSH_INTERVAL);

// ─────────────────────────────────────────────────────────────────────────────
// Main Socket Handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
const roomSocketHandler = (io, socket) => {
  if (!globalIo) globalIo = io;

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Releases all locks held by a given socketId.
   * Called on disconnect or explicit leave.
   */
  const cleanupUserLocks = (socketId) => {
    roomLocks.forEach((locks, roomId) => {
      Object.keys(locks).forEach((objectId) => {
        if (locks[objectId].socketId === socketId) {
          delete locks[objectId];
          io.to(roomId).emit("object-unlocked", { objectId });
        }
      });
    });
  };

  /**
   * Returns a sanitised participant list for a room, filtered to live sockets only.
   * @param {string} roomId
   */
  const getParticipantsList = async (roomId) => {
    try {
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
      if (!socketsInRoom || socketsInRoom.size === 0) return [];

      const liveUserIds = new Set();
      for (const sid of socketsInRoom) {
        const s = io.sockets.sockets.get(sid);
        if (s?.data?.userId) liveUserIds.add(s.data.userId);
      }
      if (liveUserIds.size === 0) return [];

      const participants = await Participant.find({
        room: roomId,
        user: { $in: Array.from(liveUserIds) },
        isBanned: false,
      }).populate("user", "username email avatar");

      return participants.map((p) => ({
        id: p._id,
        userId: p.user._id,
        username: p.user.username,
        email: p.user.email,
        avatar: p.user.avatar,
        role: p.role,
        joinedAt: p.joinedAt,
        lastActive: p.lastSeen,
      }));
    } catch (error) {
      console.error("Error getting participants list:", error);
      return [];
    }
  };

  // ── Connection Management ──────────────────────────────────────────────────

  /**
   * Event: join-room
   * Resolves roomId (ObjectId or roomCode), authenticates the user, and
   * sends the authoritative canvas state to the joining client.
   */
  socket.on("join-room", async ({ roomId, userId }) => {
    try {
      // Support both MongoDB _id and human-readable roomCode
      const room = await Room.findOne({
        $or: [
          ...(mongoose.Types.ObjectId.isValid(roomId) ? [{ _id: roomId }] : []),
          { roomCode: roomId },
        ],
        isActive: true,
      });

      if (!room) return socket.emit("error", { message: "Room not found" });

      const resolvedRoomId = room._id.toString();

      const participant = await Participant.findOne({
        user: userId,
        room: resolvedRoomId,
      }).populate("user", "username");

      if (participant?.isBanned) {
        return socket.emit("error", { message: "You have been banned from this room" });
      }

      socket.join(resolvedRoomId);
      socket.data = { userId, roomId: resolvedRoomId };

      if (participant) {
        socket.to(resolvedRoomId).emit("user-joined", {
          user: participant.user.username,
          userId,
          role: participant.role,
        });
      }

      const participantsList = await getParticipantsList(resolvedRoomId);
      io.to(resolvedRoomId).emit("participants-updated", { participants: participantsList });

      // Initialise memory state from DB on first join
      if (!activeRooms.has(resolvedRoomId)) {
        activeRooms.set(resolvedRoomId, room.drawingData || []);
      }

      // Respond with the full authoritative state so the client can bootstrap
      socket.emit("room-state", {
        room,
        drawingData: activeRooms.get(resolvedRoomId),
        activeLocks: roomLocks.get(resolvedRoomId) || {},
        resolvedRoomId,
      });
    } catch (error) {
      console.error("join-room error:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  /**
   * Event: leave-room
   * Explicit departure — removes from channel, cleans locks, refreshes roster.
   */
  socket.on("leave-room", async ({ roomId, userId }) => {
    socket.leave(roomId);
    cleanupUserLocks(socket.id);
    socket.to(roomId).emit("user-left", { userId });
    const list = await getParticipantsList(roomId);
    io.to(roomId).emit("participants-updated", { participants: list });
  });

  /**
   * Event: disconnect
   * Automatic cleanup when the WebSocket connection drops.
   */
  socket.on("disconnect", () => {
    if (socket.data?.roomId) {
      cleanupUserLocks(socket.id);
      socket.to(socket.data.roomId).emit("user-left", { userId: socket.data.userId });
      getParticipantsList(socket.data.roomId).then((list) => {
        io.to(socket.data.roomId).emit("participants-updated", { participants: list });
      });
    }
  });

  /**
   * Event: request-participants
   * Allows a client to explicitly refresh its participant roster.
   */
  socket.on("request-participants", async ({ roomId }) => {
    if (!roomId) return;
    try {
      const list = await getParticipantsList(roomId);
      socket.emit("participants-updated", { participants: list });
    } catch (error) {
      console.error("request-participants error:", error);
    }
  });

  // ── Health / Latency ───────────────────────────────────────────────────────

  /**
   * Event: ping
   * Connection health monitoring — echoes back id and server timestamp so the
   * client can calculate round-trip latency.
   * Supports both ping(cb) and ping({ id, timestamp }, cb) call signatures.
   */
  socket.on("ping", (data, cb) => {
    if (typeof data === "function") {
      data({ id: Date.now(), timestamp: Date.now() });
    } else if (typeof cb === "function") {
      cb({ id: data?.id ?? Date.now(), timestamp: Date.now() });
    }
  });

  // ── Cursor Presence ────────────────────────────────────────────────────────

  /**
   * Event: cursor-move
   * Volatile broadcast of cursor position + tool metadata for ghost cursors.
   */
  socket.on("cursor-move", ({ roomId, x, y, userId, username, tool, color }) => {
    socket.volatile.to(roomId).emit("cursor-update", { userId, x, y, username, tool, color });
  });

  // ── Drawing Updates ────────────────────────────────────────────────────────

  /**
   * Event: drawing-update
   * Accepts single elements, element arrays, or compressed batches.
   * Applies last-write-wins (LWW) conflict resolution per element and
   * forwards decompressed updates to peers.
   */
  socket.on("drawing-update", (data) => {
    // Normalise to a flat array regardless of payload shape
    let elementsToProcess = [];
    if (data.compressed && Array.isArray(data.elements)) {
      elementsToProcess = decompressDrawingData(data.elements);
    } else if (data.element) {
      elementsToProcess = [data.element];
    } else if (Array.isArray(data.elements)) {
      elementsToProcess = data.elements;
    }

    // Broadcast decompressed elements individually to peers immediately
    elementsToProcess.forEach((el) => {
      socket.to(data.roomId).emit("drawing-update", {
        roomId: data.roomId,
        element: el,
        compressed: false,
        saveToDb: false,
      });
    });

    // Skip state update if there's nothing to persist
    if (elementsToProcess.length === 0 || !data.saveToDb) return;

    if (!elementVersions.has(data.roomId)) elementVersions.set(data.roomId, {});
    const versions = elementVersions.get(data.roomId);

    if (!activeRooms.has(data.roomId)) activeRooms.set(data.roomId, []);
    const authoritativeState = activeRooms.get(data.roomId);

    elementsToProcess.forEach((element) => {
      if (!element?.id) return;

      // LWW: reject updates older than the version already in memory
      const incomingTs = element.updatedAt || element._clientTs || Date.now();
      const existing = versions[element.id];
      if (existing && existing.timestamp > incomingTs) return;

      versions[element.id] = {
        timestamp: incomingTs,
        version: existing ? existing.version + 1 : 1,
      };

      const index = authoritativeState.findIndex((el) => el.id === element.id);
      if (index !== -1) authoritativeState[index] = element;
      else authoritativeState.push(element);
    });

    pendingSaves.add(data.roomId);
  });

  /**
   * Event: canvas-sync
   * Full-state replacement from a client (e.g. after undo/redo).
   * Overwrites the authoritative state and fans out to all peers.
   */
  socket.on("canvas-sync", ({ roomId, elements }) => {
    if (!roomId || !Array.isArray(elements)) return;
    activeRooms.set(roomId, elements);
    pendingSaves.add(roomId);
    socket.to(roomId).emit("canvas-sync", { elements });
  });

  /**
   * Event: clear-canvas
   * Resets the entire drawing state for the room and persists immediately.
   */
  socket.on("clear-canvas", async ({ roomId }) => {
    io.to(roomId).emit("canvas-cleared");
    activeRooms.set(roomId, []);
    pendingSaves.add(roomId);
    await Room.findByIdAndUpdate(roomId, { drawingData: [] }).catch(console.error);
  });

  // ── Save / Sync ────────────────────────────────────────────────────────────

  /**
   * Event: save-canvas
   * Explicit save triggered by the frontend (Ctrl+S or auto-save hook).
   * Commits to DB immediately and creates a CanvasVersion snapshot.
   * Rotates auto-saves to keep at most 20.
   *
   * Payload: { roomId, elements: DrawingElement[], timestamp?, userId }
   */
  socket.on("save-canvas", async ({ roomId, elements, timestamp, userId }) => {
    if (!roomId || !Array.isArray(elements)) {
      return socket.emit("save-error", { error: "Invalid save payload" });
    }
    try {
      activeRooms.set(roomId, elements);
      await Room.findByIdAndUpdate(roomId, { drawingData: elements, updatedAt: new Date() });
      pendingSaves.delete(roomId);

      const snapshot = new CanvasVersion({
        room: roomId,
        savedBy: userId || null,
        elements,
        label: "Auto-save",
        isAutoSave: true,
      });
      await snapshot.save();

      // Rotate: keep only last 20 auto-saves
      const autoCount = await CanvasVersion.countDocuments({ room: roomId, isAutoSave: true });
      if (autoCount > 20) {
        const oldest = await CanvasVersion.find(
          { room: roomId, isAutoSave: true },
          { _id: 1 },
          { sort: { createdAt: 1 }, limit: autoCount - 20 }
        );
        await CanvasVersion.deleteMany({ _id: { $in: oldest.map((v) => v._id) } });
      }

      socket.emit("save-confirmed", {
        timestamp: timestamp || Date.now(),
        versionId: snapshot._id,
      });
    } catch (err) {
      console.error("save-canvas error:", err);
      socket.emit("save-error", { error: "Failed to persist canvas" });
    }
  });

  /**
   * Event: request-sync
   * State reconciliation on reconnection.
   * Sends the full authoritative canvas state + active lock map to the requester.
   *
   * Payload: { roomId, lastSyncTimestamp? }
   */
  socket.on("request-sync", async ({ roomId }) => {
    if (!roomId) return;
    try {
      const room = await Room.findById(roomId).lean();
      if (!room) return socket.emit("sync-error", { error: "Room not found" });

      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, room.drawingData || []);
      }

      const lockMap = roomLocks.get(roomId) || {};
      const activeLocks = Object.entries(lockMap).map(([elementId, lock]) => ({
        elementId,
        ...lock,
      }));

      socket.emit("room-state", {
        drawingData: activeRooms.get(roomId),
        resolvedRoomId: room._id,
        locks: activeLocks,
        participants: await getParticipantsList(roomId),
        serverTimestamp: Date.now(),
        isSyncResponse: true,
      });
    } catch (err) {
      console.error("request-sync error:", err);
      socket.emit("sync-error", { error: "Failed to sync state" });
    }
  });

  // ── Element Locking ────────────────────────────────────────────────────────

  /**
   * Event: request-lock
   * Requests an exclusive lock on a drawing element.
   * Emits `lock-granted` + legacy `object-locked` on success,
   * `lock-denied` if already held by another user.
   */
  socket.on("request-lock", ({ roomId, objectId, elementId, userId, username, color }) => {
    const id = elementId || objectId;
    if (!id || !roomId) return;

    if (!roomLocks.has(roomId)) roomLocks.set(roomId, {});
    const roomLocksMap = roomLocks.get(roomId);
    const currentLock = roomLocksMap[id];
    const now = Date.now();

    if (currentLock && currentLock.userId !== userId && now - currentLock.timestamp < LOCK_TIMEOUT) {
      return socket.emit("lock-denied", {
        elementId: id,
        objectId: id,
        lockedBy: currentLock.userId,
        reason: "locked",
      });
    }

    roomLocksMap[id] = {
      userId,
      socketId: socket.id,
      username: username || "User",
      color: color || "#3b82f6",
      timestamp: now,
    };

    io.to(roomId).emit("lock-granted", { elementId: id, userId, username: username || "User", color: color || "#3b82f6" });
    io.to(roomId).emit("object-locked", { elementId: id, objectId: id, userId, username: username || "User", color: color || "#3b82f6" });
  });

  /**
   * Event: release-lock
   * Explicitly releases a lock. Emits `lock-released` + legacy `object-unlocked`.
   */
  socket.on("release-lock", ({ roomId, objectId, elementId, userId, isAutoRelease }) => {
    const id = elementId || objectId;
    if (!id || !roomId) return;

    const roomLocksMap = roomLocks.get(roomId);
    if (roomLocksMap?.[id]?.userId === userId) {
      delete roomLocksMap[id];
      io.to(roomId).emit("lock-released", { elementId: id, userId, isAutoRelease: !!isAutoRelease });
      io.to(roomId).emit("object-unlocked", { elementId: id, objectId: id, userId });
    }
  });

  /**
   * Event: lock-object (legacy alias for request-lock)
   * Kept for backward compatibility with older clients.
   */
  socket.on("lock-object", ({ roomId, elementId, userId, username, color }) => {
    if (!elementId || !roomId) return;
    if (!roomLocks.has(roomId)) roomLocks.set(roomId, {});
    const roomLocksMap = roomLocks.get(roomId);
    roomLocksMap[elementId] = {
      userId,
      socketId: socket.id,
      username: username || "User",
      color: color || "#3b82f6",
      timestamp: Date.now(),
    };
    io.to(roomId).emit("lock-granted", { elementId, userId, username: username || "User", color: color || "#3b82f6" });
    io.to(roomId).emit("object-locked", { elementId, userId, username: username || "User", color: color || "#3b82f6" });
  });

  /**
   * Event: unlock-object (legacy alias for release-lock)
   * Kept for backward compatibility with older clients.
   */
  socket.on("unlock-object", ({ roomId, elementId, userId }) => {
    if (!elementId || !roomId) return;
    const roomLocksMap = roomLocks.get(roomId);
    if (roomLocksMap?.[elementId]) {
      delete roomLocksMap[elementId];
      io.to(roomId).emit("lock-released", { elementId, userId });
      io.to(roomId).emit("object-unlocked", { elementId });
    }
  });

  // ── Moderation ─────────────────────────────────────────────────────────────

  /**
   * Shared handler for kick and ban moderation actions.
   * @param {string} roomId
   * @param {string} targetUserId
   * @param {string} moderatorId
   * @param {'kick'|'ban'} action
   */
  const handleModeration = async (roomId, targetUserId, moderatorId, action) => {
    try {
      const mod = await Participant.findOne({ user: moderatorId, room: roomId });
      if (!mod || !["owner", "moderator"].includes(mod.role)) {
        return socket.emit("error", { message: "Not authorized" });
      }

      const target = await Participant.findOne({ user: targetUserId, room: roomId });
      if (!target) return socket.emit("error", { message: "Participant not found" });

      if (action === "kick") {
        await Room.findByIdAndUpdate(roomId, { $pull: { participants: target._id } });
        await Participant.findByIdAndDelete(target._id);
      } else {
        target.isBanned = true;
        await target.save();
      }

      const eventName = action === "kick" ? "participant-kicked" : "participant-banned";
      io.to(roomId).emit(eventName, { userId: targetUserId });

      // Persistent notification for the affected user
      const room = await Room.findById(roomId);
      const notifType = action === "kick" ? "kick" : "ban";
      const notifTitle = action === "kick" ? "Removed from Room" : "Banned from Room";
      const notifMessage = `You have been ${action === "kick" ? "removed from" : "banned from"} the room "${room?.name || "Unknown"}" by a moderator.`;

      const notification = await createNotification(targetUserId, notifType, notifTitle, notifMessage, {
        relatedRoomId: roomId,
        relatedUserId: moderatorId,
      });
      if (notification) {
        sendNotificationViaSocket(io, targetUserId, notifType, notification.title, notification.message, {
          relatedUserId: moderatorId,
          relatedRoomId: roomId,
        });
      }

      const list = await getParticipantsList(roomId);
      io.to(roomId).emit("participants-updated", { participants: list });
    } catch (e) {
      console.error(`${action}-participant error:`, e);
      socket.emit("error", { message: `Failed to ${action} participant` });
    }
  };

  /**
   * Event: kick-participant
   * Removes a user and deletes their membership record.
   */
  socket.on("kick-participant", ({ roomId, targetUserId, moderatorId }) =>
    handleModeration(roomId, targetUserId, moderatorId, "kick")
  );

  /**
   * Event: ban-participant
   * Sets isBanned=true on the participant record to prevent future joins.
   */
  socket.on("ban-participant", ({ roomId, targetUserId, moderatorId }) =>
    handleModeration(roomId, targetUserId, moderatorId, "ban")
  );

  // ── Chat Persistence ───────────────────────────────────────────────────────

  /**
   * Event: load-messages
   * Sends the last 100 messages for the room to the requesting socket.
   */
  socket.on("load-messages", async ({ roomId }) => {
    if (!roomId) return;
    try {
      const messages = await Message.find({ room: roomId })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean();

      socket.emit(
        "messages-loaded",
        messages.map((m) => ({
          id: m._id.toString(),
          userId: m.user.toString(),
          username: m.username,
          text: m.text,
          timestamp: m.createdAt,
          isEdited: m.isEdited,
          isDeleted: m.isDeleted,
        }))
      );
    } catch (error) {
      console.error("load-messages error:", error);
    }
  });

  /**
   * Event: chat-message
   * Persists a new message to the DB and broadcasts it to the room.
   */
  socket.on("chat-message", async ({ roomId, userId, username, message }) => {
    if (!roomId || !userId) return;
    try {
      const newMessage = new Message({ room: roomId, user: userId, username, text: message });
      await newMessage.save();

      io.to(roomId).emit("chat-message", {
        id: newMessage._id.toString(),
        userId,
        username,
        text: message,
        timestamp: newMessage.createdAt,
        isEdited: false,
        isDeleted: false,
      });
    } catch (error) {
      console.error("chat-message error:", error);
    }
  });

  /**
   * Event: edit-message
   * Allows the message author to update their message text.
   */
  socket.on("edit-message", async ({ roomId, messageId, userId, newText }) => {
    if (!roomId || !messageId || !userId) return;
    try {
      const message = await Message.findById(messageId);
      if (!message || message.user.toString() !== userId) return;

      message.text = newText;
      message.isEdited = true;
      await message.save();

      io.to(roomId).emit("message-edited", { id: messageId, text: newText, isEdited: true });
    } catch (error) {
      console.error("edit-message error:", error);
    }
  });

  /**
   * Event: delete-message
   * Soft-deletes a message (only author can delete their own messages).
   */
  socket.on("delete-message", async ({ roomId, messageId, userId }) => {
    if (!roomId || !messageId || !userId) return;
    try {
      const message = await Message.findById(messageId);
      if (!message || message.user.toString() !== userId) return;

      message.isDeleted = true;
      message.text = "This message was deleted";
      await message.save();

      io.to(roomId).emit("message-deleted", {
        id: messageId,
        text: message.text,
        isDeleted: true,
      });
    } catch (error) {
      console.error("delete-message error:", error);
    }
  });
};

module.exports = roomSocketHandler;
