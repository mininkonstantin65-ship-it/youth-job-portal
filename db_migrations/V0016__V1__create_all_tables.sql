
CREATE TABLE IF NOT EXISTS t_p86122027_youth_job_portal.users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(50),
    test_result TEXT,
    role VARCHAR(50) DEFAULT 'user',
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p86122027_youth_job_portal.jobs (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    type VARCHAR(100),
    salary VARCHAR(100),
    description TEXT,
    requirements JSONB DEFAULT '[]',
    employer_id VARCHAR(255),
    employer_email VARCHAR(255),
    age_range VARCHAR(50) DEFAULT '14-24',
    category VARCHAR(100),
    coordinates JSONB DEFAULT '[56.0184, 92.8672]',
    is_premium BOOLEAN DEFAULT FALSE,
    responsibilities JSONB DEFAULT '[]',
    conditions JSONB DEFAULT '[]',
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p86122027_youth_job_portal.applications (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_phone VARCHAR(50),
    user_age INTEGER,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p86122027_youth_job_portal.messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    job_id VARCHAR(255),
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p86122027_youth_job_portal.interviews (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(255),
    user_id VARCHAR(255),
    employer_id VARCHAR(255),
    scheduled_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
