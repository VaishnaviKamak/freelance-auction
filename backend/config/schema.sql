-- Freelance Reverse Auction System - PostgreSQL Schema
-- Run this file to set up the database manually (optional - Sequelize sync also works)

CREATE DATABASE freelance_auction;
\c freelance_auction;

-- Users table (base class)
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'freelancer', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clients table (extends User)
CREATE TABLE IF NOT EXISTS clients (
  client_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Freelancers table (extends User)
CREATE TABLE IF NOT EXISTS freelancers (
  freelancer_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  skills TEXT,
  experience INTEGER DEFAULT 0,
  rating FLOAT DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Administrators table (extends User)
CREATE TABLE IF NOT EXISTS administrators (
  admin_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  access_level VARCHAR(50) DEFAULT 'standard',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  project_id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget FLOAT NOT NULL,
  deadline DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'listed', 'assigned', 'completed', 'closed')),
  assigned_freelancer_id INTEGER REFERENCES freelancers(freelancer_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
  auction_id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  bid_id SERIAL PRIMARY KEY,
  auction_id INTEGER NOT NULL REFERENCES auctions(auction_id) ON DELETE CASCADE,
  freelancer_id INTEGER NOT NULL REFERENCES freelancers(freelancer_id) ON DELETE CASCADE,
  bid_amount FLOAT NOT NULL,
  delivery_time TIMESTAMP NOT NULL,
  score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedbacks (
  feedback_id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
  freelancer_id INTEGER NOT NULL REFERENCES freelancers(freelancer_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  payment_id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
  freelancer_id INTEGER NOT NULL REFERENCES freelancers(freelancer_id) ON DELETE CASCADE,
  amount FLOAT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_freelancer_id ON bids(freelancer_id);
CREATE INDEX idx_auctions_project_id ON auctions(project_id);
CREATE INDEX idx_feedbacks_freelancer_id ON feedbacks(freelancer_id);
