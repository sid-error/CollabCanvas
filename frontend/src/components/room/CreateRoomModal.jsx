import React, { useState } from 'react';

const CreateRoomModal = ({ isOpen, onClose, onCreate }) => {
  const [roomName, setRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ name: roomName, public: isPublic });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-6">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <h2 className="text-3xl font-black text-slate-900 mb-2">New Room</h2>
        <p className="text-slate-500 mb-8 font-medium">Set up your collaborative workspace.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Room Name</label>
            <input 
              type="text" 
              placeholder="e.g. Sprint Planning" 
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Visibility</label>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button 
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${isPublic ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                Public
              </button>
              <button 
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isPublic ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                Private
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;