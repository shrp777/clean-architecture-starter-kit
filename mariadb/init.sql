CREATE TABLE IF NOT EXISTS members (
  id    VARCHAR(36)  NOT NULL,
  name  VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_members_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS books (
  id     VARCHAR(36)  NOT NULL,
  title  VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn   VARCHAR(20)  DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS loans (
  id          VARCHAR(36) NOT NULL,
  book_id     VARCHAR(36) NOT NULL,
  member_id   VARCHAR(36) NOT NULL,
  borrowed_at DATETIME    NOT NULL,
  returned_at DATETIME    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_loans_book_id (book_id),
  KEY idx_loans_member_id (member_id),
  CONSTRAINT fk_loans_book FOREIGN KEY (book_id) REFERENCES books (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
