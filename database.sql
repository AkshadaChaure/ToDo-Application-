-- Create the database (run with a user that has permission)
CREATE DATABASE IF NOT EXISTS todo_db;
USE todo_db;

-- Create todos table expected by the app/backend
CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_done TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional: seed sample data
INSERT INTO todos (title, description, is_done) VALUES
('Complete Angular Project', 'Build full-stack Todo with Angular + Hapi + MySQL', 0),
('Learn Hapi.js', 'Practice REST API with Hapi framework', 0),
('Database Design', 'Finalize schema and indexes for todos', 1);

-- Verify
SELECT * FROM todos ORDER BY id DESC;
