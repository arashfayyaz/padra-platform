const db = require("./config/database");

const schema = [

`CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(150) NOT NULL,
  description TEXT,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS permissions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL UNIQUE,
  display_name VARCHAR(150) NOT NULL,
  module VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar TEXT,
  status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
  role_id INT UNSIGNED,
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  phone_verified TINYINT(1) NOT NULL DEFAULT 0,
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT UNSIGNED NOT NULL,
  permission_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS settings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(150) NOT NULL UNIQUE,
  setting_value LONGTEXT,
  setting_type ENUM('string','number','boolean','json') NOT NULL DEFAULT 'string',
  group_name VARCHAR(100) NOT NULL DEFAULT 'general',
  is_public TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS themes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL UNIQUE,
  display_name VARCHAR(150) NOT NULL,
  mode ENUM('light','dark') NOT NULL DEFAULT 'light',
  config LONGTEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS languages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100) NOT NULL,
  direction ENUM('ltr','rtl') NOT NULL DEFAULT 'ltr',
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS pages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  template VARCHAR(100) DEFAULT 'default',
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  featured_image TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_by INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_pages_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS page_translations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  page_id INT UNSIGNED NOT NULL,
  language_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  PRIMARY KEY (id),
  UNIQUE KEY uq_page_language (page_id, language_id),
  CONSTRAINT fk_pt_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_language FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS menus (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL UNIQUE,
  location VARCHAR(100) NOT NULL DEFAULT 'header',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS menu_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  menu_id INT UNSIGNED NOT NULL,
  parent_id INT UNSIGNED,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  url TEXT,
  route VARCHAR(255),
  item_type ENUM('link','page','external','module') NOT NULL DEFAULT 'link',
  target VARCHAR(20) DEFAULT '_self',
  permission VARCHAR(150),
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_menu_items_menu FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_items_parent FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS forms (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  config LONGTEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS form_fields (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  form_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  label VARCHAR(255) NOT NULL,
  field_type VARCHAR(100) NOT NULL,
  placeholder TEXT,
  default_value TEXT,
  options LONGTEXT,
  validation LONGTEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_required TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  CONSTRAINT fk_form_fields_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS transport_providers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type ENUM('flight','train','bus') NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100),
  logo TEXT,
  api_enabled TINYINT(1) NOT NULL DEFAULT 0,
  api_base_url TEXT,
  api_config LONGTEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS stations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type ENUM('airport','railway','bus_terminal') NOT NULL,
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(150) NOT NULL,
  province VARCHAR(150),
  country VARCHAR(10) NOT NULL DEFAULT 'IR',
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS trips (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type ENUM('flight','train','bus') NOT NULL,
  provider_id INT UNSIGNED,
  external_id VARCHAR(255),
  from_station_id INT UNSIGNED,
  to_station_id INT UNSIGNED,
  from_city VARCHAR(150),
  to_city VARCHAR(150),
  departure_time DATETIME NOT NULL,
  arrival_time DATETIME NOT NULL,
  price BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'IRR',
  capacity INT DEFAULT 0,
  available_seats INT DEFAULT 0,
  company VARCHAR(255),
  class VARCHAR(100),
  flight_number VARCHAR(100),
  train_number VARCHAR(100),
  bus_number VARCHAR(100),
  amenities LONGTEXT DEFAULT '[]',
  raw_api_data LONGTEXT,
  source ENUM('local','api') NOT NULL DEFAULT 'local',
  status ENUM('active','cancelled','completed') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_trips_type (type),
  INDEX idx_trips_departure (departure_time),
  INDEX idx_trips_provider (provider_id, external_id),
  CONSTRAINT fk_trips_provider FOREIGN KEY (provider_id) REFERENCES transport_providers(id) ON DELETE SET NULL,
  CONSTRAINT fk_trips_from FOREIGN KEY (from_station_id) REFERENCES stations(id) ON DELETE SET NULL,
  CONSTRAINT fk_trips_to FOREIGN KEY (to_station_id) REFERENCES stations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS hotel_providers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100),
  api_enabled TINYINT(1) NOT NULL DEFAULT 0,
  api_base_url TEXT,
  api_config LONGTEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS hotels (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id INT UNSIGNED,
  external_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description LONGTEXT,
  city VARCHAR(150),
  address TEXT,
  country VARCHAR(10) DEFAULT 'IR',
  star_rating INT DEFAULT 0,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  images LONGTEXT DEFAULT '[]',
  amenities LONGTEXT DEFAULT '[]',
  raw_api_data LONGTEXT,
  source ENUM('local','api') NOT NULL DEFAULT 'local',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_hotels_provider FOREIGN KEY (provider_id) REFERENCES hotel_providers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS hotel_rooms (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  hotel_id INT UNSIGNED NOT NULL,
  external_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INT DEFAULT 1,
  price BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'IRR',
  amenities LONGTEXT DEFAULT '[]',
  available_rooms INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_hotel_rooms_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED,
  booking_code VARCHAR(100) NOT NULL UNIQUE,
  type ENUM('flight','train','bus','hotel','tour','education') NOT NULL,
  trip_id INT UNSIGNED,
  hotel_id INT UNSIGNED,
  room_id INT UNSIGNED,
  status ENUM('pending','confirmed','cancelled','completed','refunded') NOT NULL DEFAULT 'pending',
  total_amount BIGINT NOT NULL DEFAULT 0,
  paid_amount BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'IRR',
  passenger_data LONGTEXT,
  booking_data LONGTEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_bookings_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
  CONSTRAINT fk_bookings_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL,
  CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES hotel_rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS wallets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  balance BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'IRR',
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  wallet_id INT UNSIGNED NOT NULL,
  type ENUM('deposit','withdraw','payment','refund','adjustment') NOT NULL,
  amount BIGINT NOT NULL,
  balance_before BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  reference_type VARCHAR(100),
  reference_id INT UNSIGNED,
  description TEXT,
  status ENUM('pending','completed','failed','cancelled') NOT NULL DEFAULT 'completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_wallet_transactions_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS payment_gateways (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  merchant_id VARCHAR(255),
  config LONGTEXT DEFAULT '{}',
  is_test_mode TINYINT(1) NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS payments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED,
  gateway_id INT UNSIGNED,
  booking_id INT UNSIGNED,
  wallet_transaction_id INT UNSIGNED,
  amount BIGINT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'IRR',
  authority VARCHAR(255),
  transaction_id VARCHAR(255),
  reference_number VARCHAR(255),
  status ENUM('pending','paid','failed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  gateway_response LONGTEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_gateway FOREIGN KEY (gateway_id) REFERENCES payment_gateways(id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_wallet_tx FOREIGN KEY (wallet_transaction_id) REFERENCES wallet_transactions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS education_centers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description LONGTEXT,
  logo TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(150),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS education_courses (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  center_id INT UNSIGNED,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  language VARCHAR(100),
  level VARCHAR(100),
  description LONGTEXT,
  price BIGINT DEFAULT 0,
  capacity INT DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_education_courses_center FOREIGN KEY (center_id) REFERENCES education_centers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS education_classes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  course_id INT UNSIGNED NOT NULL,
  teacher_id INT UNSIGNED,
  name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  schedule LONGTEXT DEFAULT '{}',
  capacity INT DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'planned',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_education_classes_course FOREIGN KEY (course_id) REFERENCES education_courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_education_classes_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS education_enrollments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  class_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  amount BIGINT DEFAULT 0,
  status ENUM('pending','active','completed','cancelled') NOT NULL DEFAULT 'pending',
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_enrollment (class_id,user_id),
  CONSTRAINT fk_enrollments_class FOREIGN KEY (class_id) REFERENCES education_classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS brokers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED,
  company_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(150),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  commission_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  status ENUM('pending','active','inactive','blocked') NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_brokers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS broker_transactions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  broker_id INT UNSIGNED NOT NULL,
  booking_id INT UNSIGNED,
  type ENUM('commission','payment','adjustment') NOT NULL,
  amount BIGINT NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_broker_transactions_broker FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE,
  CONSTRAINT fk_broker_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(100) NOT NULL DEFAULT 'system',
  data LONGTEXT DEFAULT '{}',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS uploads (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED,
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  mime_type VARCHAR(150),
  size BIGINT DEFAULT 0,
  disk VARCHAR(50) NOT NULL DEFAULT 'local',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_uploads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS seo_settings (
  id TINYINT UNSIGNED NOT NULL,
  site_title VARCHAR(255) NOT NULL DEFAULT 'پادرا',
  title_template VARCHAR(255) NOT NULL DEFAULT '%s | پادرا',
  meta_description TEXT NOT NULL,
  meta_keywords TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  og_image TEXT NOT NULL,
  og_site_name VARCHAR(255) NOT NULL DEFAULT 'پادرا',
  twitter_handle VARCHAR(255) NOT NULL DEFAULT '',
  robots_index TINYINT(1) NOT NULL DEFAULT 1,
  robots_follow TINYINT(1) NOT NULL DEFAULT 1,
  robots_extra_rules TEXT NOT NULL,
  sitemap_enabled TINYINT(1) NOT NULL DEFAULT 1,
  google_site_verification VARCHAR(255) NOT NULL DEFAULT '',
  google_analytics_id VARCHAR(255) NOT NULL DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS audit_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED,
  action VARCHAR(150) NOT NULL,
  module VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT UNSIGNED,
  old_data LONGTEXT,
  new_data LONGTEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_module (module),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

(async () => {
  try {
    for (const sql of schema) {
      await db.pool.query(sql);
    }

    await db.pool.query(`
      INSERT IGNORE INTO roles
      (name,display_name,description,is_system)
      VALUES
      ('super_admin','مدیر کل','دسترسی کامل به سیستم',1),
      ('admin','مدیر','مدیریت پنل',1),
      ('broker','بروکر','مدیریت خدمات بروکر',0),
      ('teacher','مدرس','مدیریت کلاس‌ها و آموزش',0),
      ('user','کاربر','کاربر عادی سیستم',1)
    `);

    await db.pool.query(`
      INSERT IGNORE INTO languages
      (code,name,native_name,direction,is_default,is_active)
      VALUES
      ('fa','Persian','فارسی','rtl',1,1),
      ('en','English','English','ltr',0,1)
    `);

    await db.pool.query(`
      INSERT IGNORE INTO themes
      (name,display_name,mode,config,is_active)
      VALUES
      ('padra-default','Padra Default','light',
      '{"primary":"#00B8D9","darkPrimary":"#00E5FF","lightBackground":"#F8FAFC","darkBackground":"#050505"}',1)
    `);

    await db.pool.query(`
      INSERT IGNORE INTO seo_settings
      (id,site_title,title_template,meta_description,meta_keywords,canonical_url,og_image,og_site_name,robots_extra_rules)
      VALUES
      (1,'پادرا','%s | پادرا',
      'پلتفرم خدمات سفر، آموزش و خدمات مالی پادرا',
      'پادرا, سفر, بلیط, قطار, هواپیما, هتل, آموزش',
      '','','پادرا','')
    `);

    await db.pool.query(`
      INSERT IGNORE INTO menus(name,location,is_active)
      VALUES
      ('main','header',1),
      ('admin-sidebar','admin_sidebar',1)
    `);

    await db.pool.query(`
      INSERT IGNORE INTO settings
      (setting_key,setting_value,setting_type,group_name,is_public)
      VALUES
      ('site_name','پادرا','string','general',1),
      ('default_currency','IRR','string','general',1),
      ('default_language','fa','string','language',1),
      ('timezone','Asia/Tehran','string','general',1),
      ('maintenance_mode','false','boolean','system',1),
      ('registration_enabled','true','boolean','auth',1),
      ('wallet_enabled','true','boolean','wallet',1),
      ('education_enabled','true','boolean','modules',1),
      ('broker_enabled','true','boolean','modules',1)
    `);

    console.log('✅ MariaDB schema created successfully.');
    console.log('Tables:', schema.length);
    await db.pool.end();
  } catch (err) {
    console.error('❌ Schema migration failed:', err.message);
    await db.pool.end();
    process.exit(1);
  }
})();

