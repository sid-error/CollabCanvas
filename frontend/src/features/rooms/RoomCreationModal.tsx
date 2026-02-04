// src/features/rooms/RoomCreationModal.tsx
import React, { useState } from 'react';
import { X, Lock, Globe, Users, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import roomService from '../../services/roomService';

interface RoomCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (roomId: string) => void;
}

const RoomCreationModal: React.FC<RoomCreationModalProps> = ({
  isOpen,
  onClose,
  onRoomCreated
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }

    if (roomName.length < 3 || roomName.length > 50) {
      setError('Room name must be between 3 and 50 characters');
      return;
    }

    if (!isPublic && !password.trim()) {
      setError('Password is required for private rooms');
      return;
    }

    setIsCreating(true);

    try {
      const result = await roomService.createRoom({
        name: roomName,
        description: description.trim() || undefined,
        isPublic,
        password: !isPublic && password ? password : undefined,
        maxParticipants
      });

      if (result.success && result.room) {
        onRoomCreated(result.room.id);
        resetForm();
      } else {
        setError(result.message || 'Failed to create room');
      }
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setRoomName('');
    setDescription('');
    setIsPublic(true);
    setPassword('');
    setMaxParticipants(10);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Create New Room
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Room Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Room Name *
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g., Architecture Project"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                maxLength={50}
                required
                disabled={isCreating}
              />
              <div className="flex justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {roomName.length}/50 characters
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Required
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this room is for..."
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                rows={3}
                maxLength={200}
                disabled={isCreating}
              />
              <div className="flex justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {description.length}/200 characters
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Optional
                </span>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Room Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    isPublic
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  disabled={isCreating}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">Public</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Anyone can find and join
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    !isPublic
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  disabled={isCreating}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">Private</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Password required to join
                  </p>
                </button>
              </div>
            </div>

            {/* Password Input (only for private rooms) */}
            {!isPublic && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Room Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a secure password"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    minLength={4}
                    required={!isPublic}
                    disabled={isCreating}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Minimum 4 characters. Share this with invited users.
                </p>
              </div>
            )}

            {/* Max Participants */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Maximum Participants
                </label>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {maxParticipants} users
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Users className="text-slate-400" size={20} />
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  disabled={isCreating}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Small (2-10)</span>
                <span>Medium (11-30)</span>
                <span>Large (31-50)</span>
              </div>
            </div>

            {/* Information Note */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You will be the room owner and have full control over settings, participants, and permissions.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                isLoading={isCreating}
                disabled={isCreating}
                className="flex-1"
              >
                Create Room
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomCreationModal;