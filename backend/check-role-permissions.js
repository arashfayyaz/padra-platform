const db = require("./config/database");

(async () => {
  try {
    const rows = await db.all(`
      SELECT
        r.name AS role,
        COUNT(rp.permission_id) AS permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      GROUP BY r.id, r.name
      ORDER BY r.id
    `);

    console.table(rows);

    const total = await db.get(
      "SELECT COUNT(*) AS total FROM role_permissions"
    );

    console.log("TOTAL ASSIGNMENTS:", total.total);
  } catch (e) {
    console.error("MATRIX VERIFY FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
})();

