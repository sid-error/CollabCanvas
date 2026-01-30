import React from 'react';

const Sidebar = ({ user, onLogout }) => (
  <aside className="w-72 bg-slate-950 text-white p-8 flex flex-col shadow-2xl">
    <div className="flex items-center gap-3 mb-12">
      <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black">C</div>
      <span className="text-xl font-black tracking-tighter">COLLAB_CANVAS</span>
    </div>

    <nav className="flex-1 space-y-2">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Workspace</p>
      <NavItem icon="🏠" label="All Boards" active />
      <NavItem icon="📂" label="Shared with me" />
      <NavItem icon="✨" label="Templates" />
      
      <div className="pt-8">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Account</p>
        <NavItem icon="👤" label="Profile Settings" />
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </nav>

    <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
          {user.name[0]}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold truncate">{user.name}</p>
          <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
        </div>
      </div>
    </div>
  </aside>
);

const NavItem = ({ icon, label, active = false }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
    <span>{icon}</span> {label}
  </button>
);

export default Sidebar;