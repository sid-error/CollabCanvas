import React from 'react';

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const LandingPage = ({ onGetStarted, onLogin }) => (
  <div className="bg-white min-h-screen">
    <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
      <div className="text-2xl font-black text-blue-600 tracking-tighter">COLLAB_CANVAS</div>
      <button onClick={onLogin} className="text-slate-900 font-bold hover:text-blue-600">Sign In</button>
    </nav>
    <header className="max-w-4xl mx-auto text-center py-24 px-6">
      <h1 className="text-7xl font-black leading-tight tracking-tight mb-6">
        Design together, <span className="text-blue-600 underline decoration-8 decoration-blue-50">anywhere.</span>
      </h1>
      <button onClick={onGetStarted} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition shadow-2xl">
        Create Free Account
      </button>
    </header>
    <section className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-3 gap-8 text-center">
      <FeatureCard icon="⚡" title="Real-time Sync" desc="Zero-latency collaboration." />
      <FeatureCard icon="🔒" title="Secure Rooms" desc="Private drawing sessions." />
      <FeatureCard icon="🤖" title="AI Assistance" desc="Sketch-to-shape technology." />
    </section>
  </div>
);

export default LandingPage;