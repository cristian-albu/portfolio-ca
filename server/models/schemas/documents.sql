CREATE TABLE IF NOT EXISTS documents (
id uuid PRIMARY KEY,
createdAt TIMESTAMP DEFAULT NOW(),
updatedAt TIMESTAMP DEFAULT NOW()
);