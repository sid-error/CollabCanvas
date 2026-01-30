import React, { useState } from 'react';
// import Sidebar from '../components/dashboard/Sidebar';
import CreateRoomModal from '../components/room/CreateRoomModal';

const DashboardPage = ({ user, onLogout, onOpenCanvas }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateRoom = (roomData) => {
    console.log("Creating Room:", roomData);
    // Requirement 3.1.3: Proceed to canvas once room is "created"
    onOpenCanvas(); 
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} onLogout={onLogout} />
      
      <main className="flex-1 overflow-y-auto">
        <header className="px-10 py-8 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome, {user.name}!</h1>
            <p className="text-slate-500 font-medium">Ready to start a new collaborative session?</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
          >
            + Create Room
          </button>
        </header>

        {/* Inside DashboardPage.jsx - Project Section */}
        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Personal Projects</h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Project Example */}
            <div className="group bg-white border border-slate-100 rounded-[2.5rem] p-3 hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer">
              <div className="h-44 bg-blue-50 rounded-[2rem] mb-4 flex items-center justify-center text-5xl group-hover:scale-[0.98] transition-transform">
                🖼️
              </div>
              <div className="px-4 pb-4">
                <h3 className="font-bold text-slate-800">Interior Design Mockup</h3>
                <p className="text-xs text-slate-400 font-medium">Created 3 days ago</p>
              </div>
            </div>

            <button 
              onClick={() => onOpenCanvas()} 
              className="group border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 mb-4 transition-all group-hover:rotate-90">
                <span className="text-3xl">+</span>
              </div>
              <span className="font-black text-slate-400 group-hover:text-blue-600 tracking-tight">CREATE NEW PROJECT</span>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Personal Workspace</p>
            </button>
          </div>
        </section>

        <CreateRoomModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onCreate={handleCreateRoom}
        />
      </main>
    </div>
  );
};

export default DashboardPage;