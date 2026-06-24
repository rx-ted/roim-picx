ALTER TABLE images ADD COLUMN is_private INTEGER DEFAULT 0;
ALTER TABLE images ADD COLUMN private_password_hash TEXT;
