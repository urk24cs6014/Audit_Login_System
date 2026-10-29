const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/audit-logs - Query and filter activity audit trail
router.get('/', async (req, res) => {
  try {
    const { user_id, action, startDate, endDate, resource_type, resource_id, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        a.id,
        a.user_id,
        a.action,
        a.resource_type,
        a.resource_id,
        a.old_data,
        a.new_data,
        a.ip_address,
        a.timestamp,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (user_id) {
      query += ` AND a.user_id = ?`;
      queryParams.push(parseInt(user_id, 10));
    }

    if (action) {
      query += ` AND a.action = ?`;
      queryParams.push(action.toUpperCase());
    }

    if (resource_type) {
      query += ` AND a.resource_type = ?`;
      queryParams.push(resource_type);
    }

    if (resource_id) {
      query += ` AND a.resource_id = ?`;
      queryParams.push(parseInt(resource_id, 10));
    }

    if (startDate) {
      query += ` AND a.timestamp >= ?`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND a.timestamp <= ?`;
      queryParams.push(endDate);
    }

    query += ` ORDER BY a.timestamp DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(query, queryParams);

    // Parse JSON strings if necessary
    const formattedLogs = rows.map(log => ({
      ...log,
      old_data: typeof log.old_data === 'string' ? JSON.parse(log.old_data) : log.old_data,
      new_data: typeof log.new_data === 'string' ? JSON.parse(log.new_data) : log.new_data
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

module.exports = router;
