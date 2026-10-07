CREATE TABLE IF NOT EXISTS links (
  id         BIGSERIAL PRIMARY KEY,
  code       TEXT UNIQUE NOT NULL,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS clicks (
  id         BIGSERIAL PRIMARY KEY,
  link_id    BIGINT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer   TEXT,
  device     TEXT
);

CREATE INDEX IF NOT EXISTS clicks_link_id_idx ON clicks(link_id);
