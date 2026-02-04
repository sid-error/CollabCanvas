// src/features/rooms/RoomJoinModal.tsx
import React, { useState } from 'react';
import { X, Lock, Hash, AlertCircle, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import roomService from '../../services/roomService';
import { useNavigate } from 'react-router-dom';

interface RoomJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoomJoinModal: React.FC<RoomJoinModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string>('');
  const [requiresPassword, setRequiresPassword] = useState<boolean>(false);
  const [validationChecked, setValidationChecked] = useState(false);

  const validateRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const result = await roomService.validateRoom(roomCode);
      
      if (result.success) {
        setRequiresPassword(result.requiresPassword || false);
        setValidationChecked(true);
        if (!result.requiresPassword) {
          // No password required, join directly
          handleJoin();
        }
      } else {
        setError(result.message || 'Room not found');
        setValidationChecked(false);
      }
    } catch (err) {
      setError('Failed to validate room. Please try again.');
      setValidationChecked(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      setError('Room code is required');
      return;
    }

    if (requiresPassword && !password.trim()) {
      setError('Password is required for this room');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const result = await roomService.joinRoom({
        roomId: roomCode,
        password: requiresPassword ? password : undefined
      });

      if (result.success) {
        navigate(`/room/${roomCode}`);
        resetForm();
        onClose();
      } else {
        setError(result.message || 'Failed to join room');
      }
    } catch (err) {
      setError('Failed to join room. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const resetForm = () => {
    setRoomCode('');
    setPassword('');
    setError('');
    setRequiresPassword(false);
    setValidationChecked(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBack = () => {
    setValidationChecked(false);
    setRequiresPassword(false);
    setPassword('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {validationChecked ? 'Join Room' : 'Enter Room Code'}
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
        <div className="p-6">
          {!validationChecked ? (
            // Room code input step
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Hash className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Enter the room code provided by the room owner
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC-123-XYZ"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-mono text-lg tracking-wider uppercase"
                  maxLength={20}
                  disabled={isValidating}
                />
              </div>

              <Button
                onClick={validateRoom}
                isLoading={isValidating}
                disabled={isValidating || !roomCode.trim()}
                className="w-full"
              >
                Continue
              </Button>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  Don't have a room code?{' '}
                  <button
                    onClick={() => {
                      handleClose();
                      // In production, you might redirect to public rooms gallery
                      console.log('Redirect to public rooms');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Browse public rooms
                  </button>
                </p>
              </div>
            </div>
          ) : (
            // Password input step (if required)
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  This room is password protected
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Please enter the password to join
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Room Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter the room password"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    disabled={isJoining}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleJoin}
                  isLoading={isJoining}
                  disabled={isJoining || (!requiresPassword && !roomCode.trim())}
                  className="flex-1"
                >
                  Join Room
                </Button>
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                  disabled={isJoining}
                >
                  Back
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2 justify-center">
                    <Check size={14} className="text-green-500" />
                    Room code verified: <span className="font-mono font-bold">{roomCode}</span>
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomJoinModal;