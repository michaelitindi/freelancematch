import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'freelancematch.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'freelancer',
    avatar TEXT,
    bio TEXT,
    kyc_status TEXT DEFAULT 'not_started',
    is_online INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Freelancer profiles
  CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    categories TEXT, -- JSON array
    experience_years INTEGER,
    hourly_rate REAL,
    availability TEXT,
    skills TEXT, -- JSON array
    portfolio_url TEXT,
    rating REAL DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Buyer profiles
  CREATE TABLE IF NOT EXISTS buyer_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    company_name TEXT,
    company_type TEXT,
    hiring_needs TEXT, -- JSON array
    budget_range TEXT,
    total_spent REAL DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Projects/Jobs
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    freelancer_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    budget REAL,
    status TEXT DEFAULT 'open',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id)
  );

  -- Milestones
  CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    due_date TEXT,
    completed_at TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  -- Deliverables
  CREATE TABLE IF NOT EXISTS deliverables (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    milestone_id TEXT,
    name TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT,
    file_size TEXT,
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending_review',
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (milestone_id) REFERENCES milestones(id)
  );

  -- Matches
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    freelancer_id TEXT NOT NULL,
    match_score REAL,
    category_fit REAL,
    availability_score REAL,
    rating_score REAL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    responded_at TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id)
  );

  -- Messages
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id)
  );

  -- Conversations
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    participant_ids TEXT NOT NULL, -- JSON array
    last_message_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  -- Reviews/Ratings
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    reviewee_id TEXT NOT NULL,
    overall_rating INTEGER NOT NULL,
    communication_rating INTEGER,
    quality_rating INTEGER,
    timeliness_rating INTEGER,
    clarity_rating INTEGER,
    payment_rating INTEGER,
    feedback TEXT,
    status TEXT DEFAULT 'published',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id)
  );

  -- Transactions
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT,
    milestone_id TEXT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    fee REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    polar_transaction_id TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (milestone_id) REFERENCES milestones(id)
  );

  -- Activities
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata TEXT, -- JSON
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- KYC Documents
  CREATE TABLE IF NOT EXISTS kyc_documents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT,
    status TEXT DEFAULT 'pending',
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Courses (LMS)
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    duration_hours REAL,
    modules TEXT, -- JSON array
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Course Progress
  CREATE TABLE IF NOT EXISTS course_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    completed_modules TEXT, -- JSON array
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );

  -- Certifications
  CREATE TABLE IF NOT EXISTS certifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    badge_name TEXT,
    earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );
`);

export default db;

// Helper functions
export function generateId(): string {
  return crypto.randomUUID();
}

export function jsonParse<T>(str: string | null): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}
