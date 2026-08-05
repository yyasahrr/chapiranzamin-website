-- SQLite schema for local development (DB_DRIVER=sqlite).
-- Mirrors the MySQL migrations 01–06 with SQLite-compatible types.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT DEFAULT NULL,
  phone TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  organization_type TEXT DEFAULT NULL,
  registration_number TEXT DEFAULT NULL,
  economic_code TEXT DEFAULT NULL,
  phone TEXT DEFAULT NULL,
  email TEXT DEFAULT NULL,
  address TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by INTEGER DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS service_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_code TEXT NOT NULL UNIQUE,
  user_id INTEGER DEFAULT NULL,
  organization_id INTEGER DEFAULT NULL,
  request_type TEXT NOT NULL DEFAULT 'personal' CHECK (request_type IN ('personal', 'organization', 'municipal')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'contacted', 'meeting_scheduled', 'proposal_sent', 'contracted', 'in_production', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT DEFAULT NULL,
  desired_delivery_date TEXT DEFAULT NULL,
  needs_consultation INTEGER NOT NULL DEFAULT 1,
  needs_design INTEGER NOT NULL DEFAULT 0,
  needs_installation INTEGER NOT NULL DEFAULT 0,
  needs_permit_followup INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT NULL,
  admin_notes TEXT DEFAULT NULL,
  meeting_scheduled_at TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS service_requests_status_created_idx ON service_requests (status, created_at);
CREATE INDEX IF NOT EXISTS service_requests_org_status_idx ON service_requests (organization_id, status);

CREATE TABLE IF NOT EXISTS service_request_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('banner', 'billboard', 'urban_advertising', 'poster', 'brochure', 'catalog', 'sticker', 'signage', 'graphic_design', 'other')),
  title TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  width REAL DEFAULT NULL,
  height REAL DEFAULT NULL,
  dimension_unit TEXT NOT NULL DEFAULT 'cm' CHECK (dimension_unit IN ('cm', 'm')),
  material TEXT DEFAULT NULL,
  installation_location TEXT DEFAULT NULL,
  installation_address TEXT DEFAULT NULL,
  requires_permit INTEGER NOT NULL DEFAULT 0,
  requires_installation_team INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS request_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'customer')),
  message TEXT NOT NULL,
  read_at TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
