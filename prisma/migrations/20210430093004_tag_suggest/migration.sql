-- Mark this function as IMMUTABLE
CREATE FUNCTION text_array_to_text(arr TEXT[], sep text)
    RETURNS TEXT AS
$$
DECLARE
    str TEXT;
BEGIN
    SELECT array_to_string(arr, sep) INTO str;
    RETURN str;
END;
$$ IMMUTABLE LANGUAGE plpgsql;

-- Add tsq of tags
ALTER TABLE tags
    ADD COLUMN tsq tsquery
        GENERATED ALWAYS AS (
            websearch_to_tsquery('chinese_zh', text_array_to_text(array_prepend(tag, alias), ' or '))
            ) STORED;

-- Create Index
CREATE INDEX ON tags USING gin(alias);
