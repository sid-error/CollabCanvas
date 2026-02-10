import { describe, it, expect, beforeEach, vi } from "vitest";
import roomService from "../../services/roomService";

// Mock the axios instance
vi.mock("../../api/axios", () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

import api from "../../api/axios";

describe("roomService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const backendRoom = {
    id: "room-1",
    name: "Test Room",
    description: "A room for testing",
    ownerId: "user-1",
    ownerName: "Owner",
    visibility: "public",
    hasPassword: false,
    participantCount: 2,
    maxParticipants: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnail: "thumb.png",
  };

  describe("createRoom()", () => {
    it("should create room successfully", async () => {
      (api.post as any).mockResolvedValue({
        data: {
          success: true,
          room: backendRoom,
          message: "Room created",
        },
      });

      const result = await roomService.createRoom({
        name: "Test Room",
        description: "A room for testing",
        isPublic: true,
      });

      expect(api.post).toHaveBeenCalledWith("/rooms/create", {
        name: "Test Room",
        description: "A room for testing",
        visibility: "public",
        password: undefined,
      });

      expect(result.success).toBe(true);
      expect(result.room).toBeTruthy();
      expect(result.room?.name).toBe("Test Room");
      expect(result.message).toBe("Room created");
    });

    it("should return failure on API error", async () => {
      (api.post as any).mockRejectedValue({
        response: { data: { message: "Bad request" } },
      });

      const result = await roomService.createRoom({
        name: "X",
        isPublic: true,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Bad request");
    });

    it("should fallback to default message if no backend message", async () => {
      (api.post as any).mockRejectedValue({});

      const result = await roomService.createRoom({
        name: "X",
        isPublic: true,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to create room");
    });
  });

  describe("joinRoom()", () => {
    it("should join room successfully", async () => {
      (api.post as any).mockResolvedValue({
        data: {
          success: true,
          room: backendRoom,
          message: "Joined",
        },
      });

      const result = await roomService.joinRoom({
        roomId: "ABC-123",
        password: "secret",
      });

      expect(api.post).toHaveBeenCalledWith("/rooms/join", {
        roomCode: "ABC-123",
        password: "secret",
      });

      expect(result.success).toBe(true);
      expect(result.room?.id).toBe("room-1");
      expect(result.message).toBe("Joined");
    });

    it("should return failure on error", async () => {
      (api.post as any).mockRejectedValue({
        response: { data: { error: "Invalid password" } },
      });

      const result = await roomService.joinRoom({
        roomId: "ABC-123",
        password: "wrong",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid password");
    });
  });

  describe("getPublicRooms()", () => {
    it("should fetch public rooms and map them", async () => {
      (api.get as any).mockResolvedValue({
        data: {
          rooms: [backendRoom],
          pagination: { total: 1 },
        },
      });

      const result = await roomService.getPublicRooms({
        search: "test",
        sort: "popular",
        limit: 10,
        page: 2,
      });

      expect(api.get).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.rooms?.length).toBe(1);
      expect(result.rooms?.[0].name).toBe("Test Room");
      expect(result.total).toBe(1);
    });

    it("should return empty list if backend returns no rooms", async () => {
      (api.get as any).mockResolvedValue({
        data: { rooms: [] },
      });

      const result = await roomService.getPublicRooms();

      expect(result.success).toBe(true);
      expect(result.rooms).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return failure on error", async () => {
      (api.get as any).mockRejectedValue({
        response: { data: { message: "Server down" } },
      });

      const result = await roomService.getPublicRooms();

      expect(result.success).toBe(false);
      expect(result.message).toBe("Server down");
    });
  });

  describe("getMyRooms()", () => {
    it("should fetch my rooms", async () => {
      (api.get as any).mockResolvedValue({
        data: {
          rooms: [backendRoom],
        },
      });

      const result = await roomService.getMyRooms();

      expect(api.get).toHaveBeenCalledWith("/rooms/my-rooms");

      expect(result.success).toBe(true);
      expect(result.rooms?.length).toBe(1);
    });

    it("should return failure on error", async () => {
      (api.get as any).mockRejectedValue({
        response: { data: { error: "Unauthorized" } },
      });

      const result = await roomService.getMyRooms();

      expect(result.success).toBe(false);
      expect(result.message).toBe("Unauthorized");
    });
  });

  describe("getRoom()", () => {
    it("should fetch room details", async () => {
      (api.get as any).mockResolvedValue({
        data: {
          success: true,
          room: backendRoom,
          message: "OK",
        },
      });

      const result = await roomService.getRoom("room-1");

      expect(api.get).toHaveBeenCalledWith("/rooms/room-1/validate");

      expect(result.success).toBe(true);
      expect(result.room?.id).toBe("room-1");
      expect(result.message).toBe("OK");
    });

    it("should return failure on error", async () => {
      (api.get as any).mockRejectedValue({
        response: { data: { message: "Not found" } },
      });

      const result = await roomService.getRoom("room-404");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Not found");
    });
  });

  describe("updateRoom()", () => {
    it("should update room and map isPublic -> visibility", async () => {
      (api.put as any).mockResolvedValue({
        data: { success: true, message: "Updated" },
      });

      const result = await roomService.updateRoom("room-1", {
        name: "New Name",
        isPublic: false,
      });

      expect(api.put).toHaveBeenCalledWith("/rooms/room-1", {
        name: "New Name",
        visibility: "private",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Updated");
    });

    it("should return failure on error", async () => {
      (api.put as any).mockRejectedValue({
        response: { data: { error: "Forbidden" } },
      });

      const result = await roomService.updateRoom("room-1", { name: "X" });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Forbidden");
    });
  });

  describe("deleteRoom()", () => {
    it("should delete room successfully", async () => {
      (api.delete as any).mockResolvedValue({
        data: { success: true, message: "Deleted" },
      });

      const result = await roomService.deleteRoom("room-1");

      expect(api.delete).toHaveBeenCalledWith("/rooms/room-1");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Deleted");
    });

    it("should return failure on error", async () => {
      (api.delete as any).mockRejectedValue({
        response: { data: { message: "Not allowed" } },
      });

      const result = await roomService.deleteRoom("room-1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Not allowed");
    });
  });

  describe("leaveRoom()", () => {
    it("should leave room successfully", async () => {
      (api.post as any).mockResolvedValue({
        data: { success: true, message: "Left" },
      });

      const result = await roomService.leaveRoom("room-1");

      expect(api.post).toHaveBeenCalledWith("/rooms/room-1/leave");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Left");
    });

    it("should return failure on error", async () => {
      (api.post as any).mockRejectedValue({
        response: { data: { error: "Failed" } },
      });

      const result = await roomService.leaveRoom("room-1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed");
    });
  });

  describe("getParticipants()", () => {
    it("should fetch participants list", async () => {
      (api.get as any).mockResolvedValue({
        data: {
          success: true,
          participants: [{ id: "u1" }],
          message: "OK",
        },
      });

      const result = await roomService.getParticipants("room-1");

      expect(api.get).toHaveBeenCalledWith("/rooms/room-1/participants");

      expect(result.success).toBe(true);
      expect(result.participants).toEqual([{ id: "u1" }]);
    });

    it("should return failure on error", async () => {
      (api.get as any).mockRejectedValue({
        response: { data: { message: "Not found" } },
      });

      const result = await roomService.getParticipants("room-1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Not found");
    });
  });

  describe("manageParticipant()", () => {
    it("should perform action on participant", async () => {
      (api.post as any).mockResolvedValue({
        data: { success: true, message: "Kicked" },
      });

      const result = await roomService.manageParticipant(
        "room-1",
        "user-2",
        "kick"
      );

      expect(api.post).toHaveBeenCalledWith(
        "/rooms/room-1/participants/user-2",
        { action: "kick" }
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("Kicked");
    });

    it("should return failure on error with fallback action message", async () => {
      (api.post as any).mockRejectedValue({});

      const result = await roomService.manageParticipant(
        "room-1",
        "user-2",
        "ban"
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to ban participant");
    });
  });

  describe("inviteUsers()", () => {
    it("should invite users successfully", async () => {
      (api.post as any).mockResolvedValue({
        data: { success: true, message: "Invited" },
      });

      const result = await roomService.inviteUsers("room-1", ["u1", "u2"]);

      expect(api.post).toHaveBeenCalledWith("/rooms/room-1/invite", {
        userIds: ["u1", "u2"],
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Invited");
    });

    it("should return failure on error", async () => {
      (api.post as any).mockRejectedValue({
        response: { data: { error: "Cannot invite" } },
      });

      const result = await roomService.inviteUsers("room-1", ["u1"]);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Cannot invite");
    });
  });
});
