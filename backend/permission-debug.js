const { all } = require('./config/database');

async function main() {
  console.log('===== DB PERMISSION DEBUG =====');

  const roles = await all(`
    SELECT
      r.id,
      r.name,
      COUNT(rp.permission_id) AS permission_count
    FROM roles r
    LEFT JOIN role_permissions rp
      ON rp.role_id = r.id
    GROUP BY r.id, r.name
    ORDER BY r.id
  `);

  console.log('\n===== ROLE COUNTS =====');
  console.table(roles);

  const permissions = await all(`
    SELECT
      r.name AS role,
      p.name AS permission
    FROM roles r
    LEFT JOIN role_permissions rp
      ON rp.role_id = r.id
    LEFT JOIN permissions p
      ON p.id = rp.permission_id
    ORDER BY r.id, p.id
  `);

  console.log('\n===== ROLE PERMISSIONS =====');
  console.table(permissions);

  const users = await all(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.is_active
    FROM users u
    ORDER BY u.id
  `);

  console.log('\n===== USERS =====');
  console.table(users);

  console.log('\n===== DEBUG FINISHED =====');
}

main().catch(error => {
  console.error('\nDB PERMISSION DEBUG FAILED:', error.message);
});
