const db = require("./config/database");

const matrix = {
  super_admin: ["*"],
  admin: [
    "users.view","users.create","users.update","users.delete",
    "roles.view","roles.create","roles.update","roles.delete",
    "settings.view","settings.update",
    "themes.view","themes.manage",
    "languages.view","languages.manage",
    "cms.view","cms.manage",
    "menus.view","menus.manage",
    "forms.view","forms.manage",
    "transport.view","transport.manage",
    "hotels.view","hotels.manage",
    "bookings.view","bookings.manage",
    "wallet.view","wallet.manage",
    "payments.view","payments.manage",
    "education.view","education.manage",
    "broker.view","broker.manage",
    "notifications.view","notifications.manage",
    "uploads.view","uploads.manage",
    "seo.view","seo.manage"
  ],
  broker: [
    "broker.view","broker.manage",
    "bookings.view","bookings.manage",
    "payments.view"
  ],
  teacher: [
    "education.view","education.manage"
  ],
  user: [
    "transport.view",
    "hotels.view",
    "bookings.view",
    "bookings.manage",
    "wallet.view",
    "wallet.manage",
    "payments.view",
    "education.view",
    "broker.view"
  ]
};

(async () => {
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const [roleName, permissionNames] of Object.entries(matrix)) {
      const [roles] = await conn.execute(
        "SELECT id FROM roles WHERE name = ? LIMIT 1",
        [roleName]
      );

      if (!roles.length) throw new Error(`Role not found: ${roleName}`);

      const roleId = roles[0].id;

      const names = permissionNames.includes("*")
        ? (await conn.execute("SELECT name FROM permissions"))[0].map(row => row.name)
        : permissionNames;

      for (const permissionName of names) {
        const [permissions] = await conn.execute(
          "SELECT id FROM permissions WHERE name = ? LIMIT 1",
          [permissionName]
        );

        if (!permissions.length) {
          throw new Error(`Permission not found: ${permissionName}`);
        }

        await conn.execute(
          "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
          [roleId, permissions[0].id]
        );
      }
    }

    await conn.commit();
    console.log("Role-Permission matrix seeded successfully.");
  } catch (e) {
    await conn.rollback();
    console.error("ROLE-PERMISSION SEED FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    conn.release();
  }
})();
