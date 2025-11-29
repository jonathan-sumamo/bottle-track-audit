-- SQL Migration Script for BottleSys
-- Version: 1
-- Timestamp: 2025-11-29

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables in reverse order of creation for clean re-runs
DROP TABLE IF EXISTS complaint_history;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS issue_types;
DROP TABLE IF EXISTS users;

-- User Roles Enum Type (optional but good practice)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Outlet', 'Sales Rep', 'FGS Warehouse', 'QC Lab', 'Finance', 'Admin', 'EXCO');
    END IF;
END$$;

-- Complaint Status Enum Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_status') THEN
        CREATE TYPE complaint_status AS ENUM (
            'Pending Validation', 
            'Validated', 
            'Forwarded to FGS',
            'Forwarded to QC',
            'QC Report Uploaded',
            'Replacement Approved',
            'ERP Updated',
            'Closed'
        );
    END IF;
END$$;

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100),
    role user_role NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issue Types Table
CREATE TABLE issue_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Complaints Table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_code VARCHAR(20) UNIQUE NOT NULL,
    outlet_name VARCHAR(255) NOT NULL,
    outlet_phone VARCHAR(50),
    outlet_email VARCHAR(255),
    sales_rep_id UUID REFERENCES users(id),
    sku VARCHAR(100) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    production_date DATE,
    expiry_date DATE,
    issue_type_id INT REFERENCES issue_types(id),
    description TEXT NOT NULL,
    photos TEXT[], -- Array of photo URLs
    status complaint_status DEFAULT 'Pending Validation',
    validation_result TEXT,
    qc_report_file VARCHAR(255), -- URL to the file
    replacement_document VARCHAR(255), -- URL to the file
    erp_update_confirmed BOOLEAN DEFAULT FALSE,
    assigned_to_fgs BOOLEAN DEFAULT FALSE,
    assigned_to_qc BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaint History Table
CREATE TABLE complaint_history (
    id SERIAL PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    changed_by_id UUID NOT NULL REFERENCES users(id),
    status_from complaint_status,
    status_to complaint_status NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_sales_rep_id ON complaints(sales_rep_id);
CREATE INDEX idx_complaint_history_complaint_id ON complaint_history(complaint_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Seed initial data

-- 1. Issue Types
INSERT INTO issue_types (name) VALUES
('Product Quality'),
('Packaging Damage'),
('Foreign Object'),
('Shortage/Overage'),
('Expired Product');

-- 2. Sample Users (replace with real data, passwords are 'password123' hashed)
-- Note: Manually hash passwords for production. This is for testing only.
INSERT INTO users (name, email, phone, department, role, password_hash) VALUES
('Admin User', 'admin@bottlesys.com', '1234567890', 'IT', 'Admin', '$2a$10$E.MFmLp2g35gBEaKzK./y.2d6d.EAK5goTqL2j.Sg8jd2r2yUnC9W'),
('Outlet User', 'outlet@bottlesys.com', '1234567891', 'Sales', 'Outlet', '$2a$10$E.MFmLp2g35gBEaKzK./y.2d6d.EAK5goTqL2j.Sg8jd2r2yUnC9W'),
('Sales Rep User', 'sales@bottlesys.com', '1234567892', 'Sales', 'Sales Rep', '$2a$10$E.MFmLp2g35gBEaKzK./y.2d6d.EAK5goTqL2j.Sg8jd2r2yUnC9W'),
('FGS Warehouse User', 'fgs@bottlesys.com', '1234567893', 'Logistics', 'FGS Warehouse', '$2a$10$E.MFmLp2g35gBEaKzK./y.2d6d.EAK5goTqL2j.Sg8jd2r2yUnC9W'),
('QC Lab User', 'qc@bottlesys.com', '1234567894', 'Quality', 'QC Lab', '$2a$10$E.MFmLp2g35gBEaKzK./y.2d6d.EAK5goTqL2j.Sg8jd2r2yUnC9W'),
('Finance User', 'finance@bottlesys.com', '1234567895', 'Finance', 'Finance', '$2a$10$E.MFmLp2g35gBEaKzK./y.2d6d.EAK5goTqL2j.Sg8jd2r2yUnC9W'),
('EXCO User', 'exco@bottlesys.com', '1234567896', 'Management', 'EXCO', '$2a$10$E.MFmLp2g35gBEaKzK./y.2d6d.EAK5goTqL2j.Sg8jd2r2yUnC9W');


-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update 'updated_at' on table changes
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_complaints
BEFORE UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


COMMIT;

