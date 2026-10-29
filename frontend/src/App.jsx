import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DocumentEditor from './components/DocumentEditor';
import AuditFeed from './components/AuditFeed';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function App() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'audit'
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters for Audit Feed
  const [auditFilters, setAuditFilters] = useState({
    user_id: '',
    action: '',
    resource_id: '',
    startDate: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
      if (data.length > 0 && !activeUser) {
        setActiveUser(data[0]); // Default to first user (Admin)
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/documents`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  // Fetch audit logs with query filter parameters
  const fetchAuditLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (auditFilters.user_id) params.append('user_id', auditFilters.user_id);
      if (auditFilters.action) params.append('action', auditFilters.action);
      if (auditFilters.resource_id) params.append('resource_id', auditFilters.resource_id);
      if (auditFilters.startDate) params.append('startDate', auditFilters.startDate);

      const res = await fetch(`${API_BASE}/api/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setAuditLogs(data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    }
  }, [auditFilters]);

  // Initial load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchDocuments()]);
      setLoading(false);
    }
    loadData();
  }, []);

  // Refetch audit logs when filters change or when active tab switches to 'audit'
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs, activeTab]);

  // Create Document Handler
  const handleCreateDocument = async (docData) => {
    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUser?.id || 1,
        },
        body: JSON.stringify(docData),
      });

      if (!res.ok) throw new Error('Failed to create document');
      const newDoc = await res.json();
      
      showToast(`Document "${newDoc.title}" created! CREATE audit log recorded.`);
      await fetchDocuments();
      await fetchAuditLogs();
    } catch (err) {
      console.error('Error creating document:', err);
      alert('Failed to create document: ' + err.message);
    }
  };

  // Update Document Handler
  const handleUpdateDocument = async (id, docData) => {
    try {
      const res = await fetch(`${API_BASE}/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUser?.id || 1,
        },
        body: JSON.stringify(docData),
      });

      if (!res.ok) throw new Error('Failed to update document');
      const updatedDoc = await res.json();

      showToast(`Document #${id} updated! UPDATE audit log recorded.`);
      await fetchDocuments();
      await fetchAuditLogs();
    } catch (err) {
      console.error('Error updating document:', err);
      alert('Failed to update document: ' + err.message);
    }
  };

  // Delete Document Handler
  const handleDeleteDocument = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': activeUser?.id || 1,
        },
      });

      if (!res.ok) throw new Error('Failed to delete document');

      showToast(`Document #${id} deleted! DELETE audit log recorded.`);
      await fetchDocuments();
      await fetchAuditLogs();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-slate-400">Loading Audit Logger System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl glass-panel border border-emerald-500/40 bg-emerald-950/90 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        users={users}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'documents' ? (
          <DocumentEditor
            documents={documents}
            activeUser={activeUser}
            onCreateDoc={handleCreateDocument}
            onUpdateDoc={handleUpdateDocument}
            onDeleteDoc={handleDeleteDocument}
          />
        ) : (
          <AuditFeed
            auditLogs={auditLogs}
            users={users}
            onRefresh={fetchAuditLogs}
            filters={auditFilters}
            setFilters={setAuditFilters}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-4 text-center text-xs font-mono text-slate-500">
        Role-Based Activity Audit Logging System &bull; MySQL 8.x + Express + React (Vite)
      </footer>

    </div>
  );
}
