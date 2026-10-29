import React from 'react';
import { Shield, FileText, History, UserCheck, ShieldAlert } from 'lucide-react';

export default function Header({ users, activeUser, setActiveUser, activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Activity Audit Logger
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                MySQL Audit Trail & Role-Based RBAC
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'documents'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Document Editor
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              Audit Log Feed
              {activeUser?.role === 'ADMIN' && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  Admin
                </span>
              )}
            </button>
          </nav>

          {/* User Switcher Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Acting Identity</span>
                <select
                  value={activeUser?.id || ''}
                  onChange={(e) => {
                    const selected = users.find((u) => u.id === parseInt(e.target.value, 10));
                    if (selected) setActiveUser(selected);
                  }}
                  className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer pr-2"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id} className="bg-slate-900 text-slate-100">
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Badge Indicator */}
            <span
              className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${
                activeUser?.role === 'ADMIN'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {activeUser?.role === 'ADMIN' ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
              {activeUser?.role || 'MEMBER'}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
