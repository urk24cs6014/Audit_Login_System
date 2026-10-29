const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/users - Get list of all users for role switcher
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
