const db = require('../db');

/**
 * Non-blocking Audit Logger Express Middleware Factory
 * 
 * @param {Object} options
 * @param {string} options.resourceType - The name of the resource (e.g., 'documents', 'users')
 * @param {Function} [options.getRecordById] - Async function to fetch current state before mutation (req) => Promise<Object>
 */
function createAuditLogger({ resourceType, getRecordById }) {
  return async (req, res, next) => {
    // Only audit mutating HTTP methods
    const allowedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!allowedMethods.includes(req.method)) {
      return next();
    }

    // Extract user identity from request header (Simulating Auth session)
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id'], 10) : null;
    const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '127.0.0.1';

    let action = 'CREATE';
    if (req.method === 'PUT' || req.method === 'PATCH') {
      action = 'UPDATE';
    } else if (req.method === 'DELETE') {
      action = 'DELETE';
    }

    // 1. Fetch pre-mutation state (old_data) for UPDATE and DELETE operations
    let oldData = null;
    if ((action === 'UPDATE' || action === 'DELETE') && typeof getRecordById === 'function') {
      try {
        oldData = await getRecordById(req);
      } catch (err) {
        console.warn(`[AuditLogger Warning] Could not fetch pre-mutation data for ${resourceType}:`, err.message);
      }
    }

    // 2. Intercept res.json to capture response payload and trigger audit insert post-response
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      // Execute original res.json response first to avoid blocking client
      const responseResult = originalJson(body);

      // 3. Asynchronously record audit log if request succeeded (2xx HTTP status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            let resourceId = null;
            let newData = null;

            if (action === 'CREATE') {
              resourceId = body?.id || body?.document?.id || body?.data?.id || null;
              newData = body;
            } else if (action === 'UPDATE') {
              resourceId = req.params.id ? parseInt(req.params.id, 10) : (body?.id || null);
              newData = body;
            } else if (action === 'DELETE') {
              resourceId = req.params.id ? parseInt(req.params.id, 10) : null;
              newData = null;
            }

            // Insert audit record into MySQL
            const query = `
              INSERT INTO audit_logs 
                (user_id, action, resource_type, resource_id, old_data, new_data, ip_address, timestamp) 
              VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            await db.execute(query, [
              userId,
              action,
              resourceType,
              resourceId,
              oldData ? JSON.stringify(oldData) : null,
              newData ? JSON.stringify(newData) : null,
              ipAddress
            ]);

            console.log(`📌 [AuditLog Recorded] User ${userId} performed ${action} on ${resourceType} #${resourceId}`);
          } catch (auditErr) {
            // Graceful non-blocking error handling: Log failure without throwing
            console.error('❌ [AuditLog Failed] Failed to persist audit trail:', auditErr.message);
          }
        });
      }

      return responseResult;
    };

    next();
  };
}

module.exports = createAuditLogger;
