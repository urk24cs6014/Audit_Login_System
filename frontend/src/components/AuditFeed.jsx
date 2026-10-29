import React, { useState } from 'react';
import { Search, Filter, Calendar, User, Eye, History, Shield, Laptop, RefreshCw } from 'lucide-react';
import { formatTimestamp } from '../utils/diffHelper';
import DiffModal from './DiffModal';

export default function AuditFeed({ auditLogs, users, onRefresh, filters, setFilters }) {
  const [selectedLog, setSelectedLog] = useState(null);

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            CREATE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            UPDATE
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            DELETE
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            {action}
          </span>
        );
    }
  };

  const generateHumanSummary = (log) => {
    const userName = log.user_name || `User #${log.user_id || 'System'}`;
    const roleText = log.user_role ? `(${log.user_role})` : '';

    switch (log.action) {
      case 'CREATE':
        return `${userName} ${roleText} created new ${log.resource_type} #${log.resource_id}`;
      case 'UPDATE':
        return `${userName} ${roleText} modified attributes on ${log.resource_type} #${log.resource_id}`;
      case 'DELETE':
        return `${userName} ${roleText} permanently deleted ${log.resource_type} #${log.resource_id}`;
      default:
        return `${userName} ${roleText} performed ${log.action} on ${log.resource_type} #${log.resource_id}`;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
            <Filter className="w-5 h-5 text-indigo-400" />
            <span>Audit Trail Filtering & Control</span>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Logs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* User Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Filter by User</label>
            <select
              value={filters.user_id || ''}
              onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Filter by Action</label>
            <select
              value={filters.action || ''}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Actions (CREATE, UPDATE, DELETE)</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Resource ID Search */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Resource ID</label>
            <div className="relative">
              <input
                type="number"
                placeholder="e.g. 2"
                value={filters.resource_id || ''}
                onChange={(e) => setFilters({ ...filters, resource_id: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

        </div>
      </div>

      {/* Timeline Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Activity Timeline ({auditLogs.length} Records Captured)</span>
        </h3>

        {auditLogs.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800">
            <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-slate-300 font-semibold">No Audit Logs Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No matching activity events recorded for the selected filter criteria. Try resetting filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="glass-panel p-4 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition flex items-center justify-between gap-4"
              >
                
                {/* Left Side: Avatar & Event Meta */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-md ${
                      log.user_role === 'ADMIN'
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {log.user_name ? log.user_name.substring(0, 2).toUpperCase() : 'SYS'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getActionBadge(log.action)}
                      <span className="text-xs font-semibold text-slate-100">
                        {generateHumanSummary(log)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-slate-500" />
                        IP: {log.ip_address || '127.0.0.1'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Diff View Button */}
                <button
                  onClick={() => setSelectedLog(log)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-blue-400 border border-blue-500/30 hover:border-blue-500/60 shadow-lg transition"
                >
                  <Eye className="w-4 h-4" />
                  Visual Diff
                </button>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Diff View Modal */}
      <DiffModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
}
