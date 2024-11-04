CREATE TABLE IF NOT EXISTS articles (
    id uuid PRIMARY KEY,
    title VARCHAR(255),
    description VARCHAR(255),
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);