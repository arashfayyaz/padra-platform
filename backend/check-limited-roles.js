const db = require("./config/database");

(async () => {
  try {
    const rows = await db.all(`
      SELECT
        r.name AS role,
        p.name AS permission
      FROM role_permissions rp
      JOIN roles r ON r.id = rp.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE r.name IN ('broker','teacher','user')
      ORDER BY r.id, p.id
    `);

    console.table(rows);
  } catch (e) {
    console.error("ROLE CHECK FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
})();
