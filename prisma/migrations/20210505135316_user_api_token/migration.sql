DROP EXTENSION IF EXISTS pgjwt;
DROP EXTENSION IF EXISTS pgcrypto;
CREATE EXTENSION pgcrypto;
CREATE EXTENSION pgjwt;

ALTER TABLE
    "pusers"
    ADD COLUMN
        "api_token" uuid UNIQUE DEFAULT public.gen_random_uuid();

