const db = require("./config/database");

const permissions = [
  ["users.view","View Users","users","view"],["users.create","Create Users","users","create"],["users.update","Update Users","users","update"],["users.delete","Delete Users","users","delete"],
  ["roles.view","View Roles","roles","view"],["roles.create","Create Roles","roles","create"],["roles.update","Update Roles","roles","update"],["roles.delete","Delete Roles","roles","delete"],
  ["settings.view","View Settings","settings","view"],["settings.update","Update Settings","settings","update"],
  ["themes.view","View Themes","themes","view"],["themes.manage","Manage Themes","themes","manage"],
  ["languages.view","View Languages","languages","view"],["languages.manage","Manage Languages","languages","manage"],
  ["cms.view","View CMS","cms","view"],["cms.manage","Manage CMS","cms","manage"],
  ["menus.view","View Menus","menus","view"],["menus.manage","Manage Menus","menus","manage"],
  ["forms.view","View Forms","forms","view"],["forms.manage","Manage Forms","forms","manage"],
  ["transport.view","View Transport","transport","view"],["transport.manage","Manage Transport","transport","manage"],
  ["hotels.view","View Hotels","hotels","view"],["hotels.manage","Manage Hotels","hotels","manage"],
  ["bookings.view","View Bookings","bookings","view"],["bookings.manage","Manage Bookings","bookings","manage"],
  ["wallet.view","View Wallet","wallet","view"],["wallet.manage","Manage Wallet","wallet","manage"],
  ["payments.view","View Payments","payments","view"],["payments.manage","Manage Payments","payments","manage"],
  ["education.view","View Education","education","view"],["education.manage","Manage Education","education","manage"],
  ["broker.view","View Broker","broker","view"],["broker.manage","Manage Broker","broker","manage"],
  ["notifications.view","View Notifications","notifications","view"],["notifications.manage","Manage Notifications","notifications","manage"],
  ["uploads.view","View Uploads","uploads","view"],["uploads.manage","Manage Uploads","uploads","manage"],
  ["seo.view","View SEO","seo","view"],["seo.manage","Manage SEO","seo","manage"],
  ["audit.view","View Audit Logs","audit","view"]
];

(async () => {
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const [name, display_name, module, action] of permissions) {
      await conn.execute(
        "INSERT INTO permissions (name,display_name,module,action) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE display_name=VALUES(display_name),module=VALUES(module),action=VALUES(action)",
        [name, display_name, module, action]
      );
    }
    await conn.commit();
    console.log(`Permissions seeded: ${permissions.length}`);
  } catch (e) {
    await conn.rollback();
    console.error("PERMISSION SEED FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    conn.release();
  }
})();

