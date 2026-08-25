const { all } = require('../config/database');

const getUserPermissions = async (userId) => {
  const rows = await all(`
    SELECT DISTINCT p.name
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    INNER JOIN role_permissions rp ON rp.role_id = r.id
    INNER JOIN permissions p ON p.id = rp.permission_id
    WHERE u.id = ?
      AND u.status = 'active'
  `, [userId]);

  return rows.map(row => row.name);
};

const loadPermissions = async (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  try {
    if (req.user.role === 'super_admin') {
      req.user.permissions = ['*'];
      return next();
    }

    req.user.permissions = await getUserPermissions(req.user.id);

    return next();
  } catch (error) {
    console.error('PERMISSION LOAD FAILED:', error);

    return res.status(500).json({
      message: 'Authorization service unavailable'
    });
  }
};

const hasPermission = (req, permission) => {
  if (!req.user || !permission) {
    return false;
  }

  const permissions = req.user.permissions || [];

  return permissions.includes('*') || permissions.includes(permission);
};

const requirePermission = (permission) => {
  if (!permission || typeof permission !== 'string') {
    throw new Error('Permission name is required');
  }

  return async (req, res, next) => {
    try {
      await loadPermissions(req, res, () => {});

      if (res.headersSent) return;

      if (!hasPermission(req, permission)) {
        return res.status(403).json({
          message: 'Insufficient permissions',
          required: permission
        });
      }

      return next();
    } catch (error) {
      console.error('PERMISSION CHECK FAILED:', error);

      return res.status(500).json({
        message: 'Authorization service unavailable'
      });
    }
  };
};

const requireAnyPermission = (...permissions) => {
  if (
    permissions.length === 0 ||
    permissions.some(permission => typeof permission !== 'string')
  ) {
    throw new Error('At least one valid permission is required');
  }

  return async (req, res, next) => {
    try {
      await loadPermissions(req, res, () => {});

      if (res.headersSent) return;

      const allowed = permissions.some(permission =>
        hasPermission(req, permission)
      );

      if (!allowed) {
        return res.status(403).json({
          message: 'Insufficient permissions',
          required_any: permissions
        });
      }

      return next();
    } catch (error) {
      console.error('PERMISSION CHECK FAILED:', error);

      return res.status(500).json({
        message: 'Authorization service unavailable'
      });
    }
  };
};

const requireAllPermissions = (...permissions) => {
  if (
    permissions.length === 0 ||
    permissions.some(permission => typeof permission !== 'string')
  ) {
    throw new Error('At least one valid permission is required');
  }

  return async (req, res, next) => {
    try {
      await loadPermissions(req, res, () => {});

      if (res.headersSent) return;

      const allowed = permissions.every(permission =>
        hasPermission(req, permission)
      );

      if (!allowed) {
        return res.status(403).json({
          message: 'Insufficient permissions',
          required_all: permissions
        });
      }

      return next();
    } catch (error) {
      console.error('PERMISSION CHECK FAILED:', error);

      return res.status(500).json({
        message: 'Authorization service unavailable'
      });
    }
  };
};

module.exports = {
  getUserPermissions,
  loadPermissions,
  hasPermission,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions
};
