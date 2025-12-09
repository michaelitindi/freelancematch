CREATE TABLE users (
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

CREATE TABLE freelancer_profiles (
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

CREATE TABLE buyer_profiles (
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

CREATE TABLE projects (
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

CREATE TABLE milestones (
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

CREATE TABLE deliverables (
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

CREATE TABLE matches (
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

CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id)
  );

CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    participant_ids TEXT NOT NULL, -- JSON array
    last_message_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

CREATE TABLE reviews (
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
    is_flagged INTEGER DEFAULT 0,
    flag_reason TEXT,
    moderation_notes TEXT,
    moderated_by TEXT,
    moderated_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id)
  );

CREATE TABLE video_rooms (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    room_url TEXT NOT NULL,
    room_name TEXT NOT NULL,
    created_by TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    recording_url TEXT,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    ended_at TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

CREATE TABLE realtime_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

CREATE TABLE transactions (
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

CREATE TABLE activities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata TEXT, -- JSON
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

CREATE TABLE kyc_documents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT,
    status TEXT DEFAULT 'pending',
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

CREATE TABLE courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    duration_hours REAL,
    modules TEXT, -- JSON array
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE course_progress (
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

CREATE TABLE certifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    badge_name TEXT,
    earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );

INSERT INTO users (id, email, name, password_hash, role, avatar, bio, kyc_status, is_online, created_at, updated_at) VALUES ('76f86f75-b273-46a2-8f63-7bebd0bdaf78', 'admin@freelancematch.com', 'Admin User', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', NULL, NULL, 'approved', 0, '2025-12-09 12:03:29', '2025-12-09 12:03:29');


















