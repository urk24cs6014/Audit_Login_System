import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, CheckCircle2, Clock, AlertCircle, ShieldAlert } from 'lucide-react';
import DocumentModal from './DocumentModal';

export default function DocumentEditor({ documents, activeUser, onCreateDoc, onUpdateDoc, onDeleteDoc }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  const handleSave = (docData) => {
    if (docData.id) {
      onUpdateDoc(docData.id, docData);
    } else {
      onCreateDoc(docData);
    }
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Published
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            In Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            <AlertCircle className="w-3 h-3" />
            Draft
          </span>
        );
    }
  };

  const publishedCount = documents.filter((d) => d.status === 'PUBLISHED').length;
  const inReviewCount = documents.filter((d) => d.status === 'IN_REVIEW').length;
  const draftCount = documents.filter((d) => d.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Documents</p>
            <h3 className="text-2xl font-bold text-slate-100">{documents.length}</h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Published</p>
            <h3 className="text-2xl font-bold text-slate-100">{publishedCount}</h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">In Review</p>
            <h3 className="text-2xl font-bold text-slate-100">{inReviewCount}</h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-slate-500/10 text-slate-400 rounded-xl border border-slate-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Drafts</p>
            <h3 className="text-2xl font-bold text-slate-100">{draftCount}</h3>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Document Workspace</h2>
          <p className="text-xs text-slate-400">
            All modifications automatically generate a non-blocking MySQL activity audit entry.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          Create New Document
        </button>
      </div>

      {/* Documents Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Document Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No documents found. Click "Create New Document" to start.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">#{doc.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{doc.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-md font-mono mt-0.5">
                        {doc.content || 'No description provided.'}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                    <td className="px-6 py-4 text-slate-400">
                      <span className="font-medium text-slate-300">
                        {doc.creator_name || `User #${doc.created_by}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {doc.updated_at ? new Date(doc.updated_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition"
                          title="Edit Document"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* Delete action with RBAC note */}
                        <button
                          onClick={() => {
                            if (activeUser?.role !== 'ADMIN' && activeUser?.id !== doc.created_by) {
                              alert('Permission Denied: Only Admins or Document Creators can delete documents.');
                              return;
                            }
                            if (confirm(`Are you sure you want to delete "${doc.title}"? This will log a DELETE audit event.`)) {
                              onDeleteDoc(doc.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialDoc={editingDoc}
      />
    </div>
  );
}
