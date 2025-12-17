CREATE TABLE IF NOT EXISTS api_keys (
  key TEXT PRIMARY KEY,
  package_type TEXT NOT NULL CHECK (package_type IN ('one-time','standard','advanced','pro','business','enterprise')),
  total_limit INTEGER NOT NULL,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS gapi_keys (
  key TEXT PRIMARY KEY,
  package_type TEXT NOT NULL CHECK (package_type IN ('one-time','standard','advanced','pro','business','enterprise')),
  total_limit INTEGER NOT NULL,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);
