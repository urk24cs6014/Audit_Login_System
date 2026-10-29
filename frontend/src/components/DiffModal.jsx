import React from 'react';
import { X, GitCompare, ArrowRight, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';
import { computeJsonDiff, formatTimestamp } from '../utils/diffHelper';

export default function DiffModal({ isOpen, onClose, log }) {
  if (!isOpen || !log) return null;

  const diffs = computeJsonDiff(log.old_data, log.new_data);

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">DELETE</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400">{action}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl glass-panel rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">Audit State Diff Analysis</h3>
                {getActionBadge(log.action)}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target: {log.resource_type} #{log.resource_id} | Performed by {log.user_name || 'System'} ({log.user_role || 'N/A'}) at {formatTimestamp(log.timestamp)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Field Level Diff */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Summary Banner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Pre-Mutation State (old_data)</span>
              <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 overflow-x-auto max-h-40">
                {log.old_data ? JSON.stringify(log.old_data, null, 2) : 'null (Newly Created Record)'}
              </pre>
            </div>

            <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Post-Mutation State (new_data)</span>
              <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 overflow-x-auto max-h-40">
                {log.new_data ? JSON.stringify(log.new_data, null, 2) : 'null (Deleted Record)'}
              </pre>
            </div>
          </div>

          {/* Field-by-Field Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span>Field Comparison Breakdown</span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full text-[10px]">
                {diffs.length} attributes evaluated
              </span>
            </h4>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Attribute Name</th>
                    <th className="px-4 py-3">Previous Value (old_data)</th>
                    <th className="px-4 py-3">New Value (new_data)</th>
                    <th className="px-4 py-3 text-right">Change Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {diffs.map((diff) => {
                    let rowBg = 'hover:bg-slate-900/30';
                    let typeBadge = null;

                    if (diff.type === 'ADDED') {
                      rowBg = 'bg-emerald-500/5 hover:bg-emerald-500/10';
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <PlusCircle className="w-3 h-3" /> Added
                        </span>
                      );
                    } else if (diff.type === 'REMOVED') {
                      rowBg = 'bg-rose-500/5 hover:bg-rose-500/10';
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <MinusCircle className="w-3 h-3" /> Removed
                        </span>
                      );
                    } else if (diff.type === 'MODIFIED') {
                      rowBg = 'bg-amber-500/10 hover:bg-amber-500/15';
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <RefreshCw className="w-3 h-3" /> Modified
                        </span>
                      );
                    } else {
                      typeBadge = (
                        <span className="text-[10px] text-slate-500 px-2 py-0.5">Unchanged</span>
                      );
                    }

                    return (
                      <tr key={diff.key} className={`transition ${rowBg}`}>
                        <td className="px-4 py-3 font-semibold text-slate-200">{diff.key}</td>
                        <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                          {diff.oldValue !== undefined ? JSON.stringify(diff.oldValue) : <span className="text-slate-600 font-sans italic">none</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-200 max-w-xs truncate">
                          {diff.newValue !== undefined ? JSON.stringify(diff.newValue) : <span className="text-slate-600 font-sans italic">none</span>}
                        </td>
                        <td className="px-4 py-3 text-right">{typeBadge}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Client IP Address: <code className="text-slate-200">{log.ip_address || '127.0.0.1'}</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close Diff Analysis
          </button>
        </div>

      </div>
    </div>
  );
}
