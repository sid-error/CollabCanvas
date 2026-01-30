import React from 'react';

const AuthForm = ({ isLogin, setIsLogin, onSubmit, onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
        <button onClick={onBack} className="text-slate-400 mb-8 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          ← Back to Home
        </button>
        
        <h2 className="text-4xl font-black text-slate-900 mb-2">
          {isLogin ? 'Welcome back.' : 'Join the club.'}
        </h2>
        <p className="text-slate-500 mb-10 font-medium">
          {isLogin ? 'Enter your details to access your workspace.' : 'Create an account to start collaborating.'}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              className="w-full p-4 bg-slate-50 rounded-2xl outline-hidden border border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
              required 
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full p-4 bg-slate-50 rounded-2xl outline-hidden border border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 bg-slate-50 rounded-2xl outline-hidden border border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
            required 
          />
          
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95 mt-4">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-slate-50 text-center">
          <p className="text-slate-500 font-medium">
            {isLogin ? "New here?" : "Already a member?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 font-black text-blue-600 hover:text-blue-800 underline decoration-blue-200 decoration-4 underline-offset-4"
            >
              {isLogin ? 'Create an account' : 'Log in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;