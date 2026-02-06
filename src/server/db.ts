import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: true,
    });
  }
  return pool;
}

export async function initializeDatabase() {
  const pool = getPool();
  
  try {
    // Create users table with role support
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'trainee' CHECK (role IN ('trainee', 'trainer', 'admin')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create scenarios table (user-created content)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scenarios (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        scenario_version INTEGER NOT NULL,
        content JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create submissions table (grading results)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scenario_id VARCHAR(255) NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
        node_id VARCHAR(255) NOT NULL,
        question_prompt TEXT NOT NULL,
        user_response_text TEXT NOT NULL,
        bucket_id VARCHAR(255),
        feedback TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for common queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_submissions_scenario_id ON submissions(scenario_id);
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
