// src/services/roomService.ts
import api from '../api/axios';

export interface Room {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  hasPassword: boolean;
  participantCount: number;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  isPublic: boolean;
  password?: string;
  maxParticipants?: number;
}

export interface JoinRoomData {
  roomId: string;
  password?: string;
}

class RoomService {
  // Create a new room
  async createRoom(roomData: CreateRoomData): Promise<{ success: boolean; room?: Room; message?: string }> {
    try {
      const response = await api.post('/rooms/create', roomData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create room'
      };
    }
  }

  // Join an existing room
  async joinRoom(joinData: JoinRoomData): Promise<{ success: boolean; room?: Room; message?: string }> {
    try {
      const response = await api.post('/rooms/join', joinData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to join room'
      };
    }
  }

  // Get public rooms
  async getPublicRooms(options?: {
    search?: string;
    sort?: 'newest' | 'popular' | 'name';
    limit?: number;
    page?: number;
  }): Promise<{ success: boolean; rooms?: Room[]; total?: number; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (options?.search) params.append('search', options.search);
      if (options?.sort) params.append('sort', options.sort);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.page) params.append('page', options.page.toString());

      const response = await api.get(`/rooms/public?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch rooms'
      };
    }
  }

  // Get user's rooms
  async getMyRooms(): Promise<{ success: boolean; rooms?: Room[]; message?: string }> {
    try {
      const response = await api.get('/rooms/my-rooms');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch your rooms'
      };
    }
  }

  // Get room details
  async getRoom(roomId: string): Promise<{ success: boolean; room?: Room; message?: string }> {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch room details'
      };
    }
  }

  // Update room settings
  async updateRoom(roomId: string, updates: Partial<CreateRoomData>): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.put(`/rooms/${roomId}`, updates);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update room'
      };
    }
  }

  // Delete room
  async deleteRoom(roomId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete(`/rooms/${roomId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete room'
      };
    }
  }

  // Leave room
  async leaveRoom(roomId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post(`/rooms/${roomId}/leave`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to leave room'
      };
    }
  }

  // Get room participants
  async getParticipants(roomId: string): Promise<{ success: boolean; participants?: any[]; message?: string }> {
    try {
      const response = await api.get(`/rooms/${roomId}/participants`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch participants'
      };
    }
  }

  // Manage participant (kick/ban/role)
  async manageParticipant(
    roomId: string, 
    userId: string, 
    action: 'kick' | 'ban' | 'promote' | 'demote'
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post(`/rooms/${roomId}/participants/${userId}`, { action });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || `Failed to ${action} participant`
      };
    }
  }

  // Validate room code
  async validateRoom(roomId: string): Promise<{ success: boolean; requiresPassword?: boolean; message?: string }> {
    try {
      const response = await api.get(`/rooms/${roomId}/validate`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Room not found'
      };
    }
  }
}

export default new RoomService();