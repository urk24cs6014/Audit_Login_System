const express = require('express');
const router = express.Router();
const db = require('../db');
const createAuditLogger = require('../middleware/auditLogger');

// Helper to fetch document snapshot before mutation
const fetchDocSnapshot = async (req) => {
  const docId = req.params.id;
  if (!docId) return null;
  const [rows] = await db.query(
    'SELECT id, title, content, status, created_by FROM documents WHERE id = ?',
    [docId]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Apply Audit Logger Middleware for documents
const docAuditLogger = createAuditLogger({
  resourceType: 'documents',
  getRecordById: fetchDocSnapshot
});

// GET /api/documents - List all documents with creator metadata
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id, 
        d.title, 
        d.content, 
        d.status, 
        d.created_by, 
        d.created_at, 
        d.updated_at,
        u.name AS creator_name,
        u.email AS creator_email
      FROM documents d
      LEFT JOIN users u ON d.created_by = u.id
      ORDER BY d.updated_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

// GET /api/documents/:id - Get single document
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, u.name AS creator_name 
      FROM documents d 
      LEFT JOIN users u ON d.created_by = u.id 
      WHERE d.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

// POST /api/documents - Create new document
router.post('/', docAuditLogger, async (req, res) => {
  try {
    const { title, content, status } = req.body;
    const userId = req.headers['x-user-id'] || 1;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const docStatus = status || 'DRAFT';

    const [result] = await db.execute(
      'INSERT INTO documents (title, content, status, created_by) VALUES (?, ?, ?, ?)',
      [title, content || '', docStatus, userId]
    );

    const newDocId = result.insertId;
    const [newDocRows] = await db.query(
      'SELECT id, title, content, status, created_by, created_at FROM documents WHERE id = ?',
      [newDocId]
    );

    res.status(201).json(newDocRows[0]);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// PUT /api/documents/:id - Update existing document
router.put('/:id', docAuditLogger, async (req, res) => {
  try {
    const docId = req.params.id;
    const { title, content, status } = req.body;

    const [existing] = await db.query('SELECT id FROM documents WHERE id = ?', [docId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await db.execute(
      'UPDATE documents SET title = COALESCE(?, title), content = COALESCE(?, content), status = COALESCE(?, status) WHERE id = ?',
      [title, content, status, docId]
    );

    const [updatedRows] = await db.query(
      'SELECT id, title, content, status, created_by, updated_at FROM documents WHERE id = ?',
      [docId]
    );

    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// DELETE /api/documents/:id - Delete document (Admin / Creator)
router.delete('/:id', docAuditLogger, async (req, res) => {
  try {
    const docId = req.params.id;

    const [existing] = await db.query('SELECT id FROM documents WHERE id = ?', [docId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await db.execute('DELETE FROM documents WHERE id = ?', [docId]);

    res.json({ message: 'Document deleted successfully', id: parseInt(docId, 10) });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;
