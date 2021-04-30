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

-- Cache tag trigger
CREATE OR REPLACE FUNCTION cache_tag_to_bookmark_on_update()
    RETURNS TRIGGER AS
$$
DECLARE tags_name text;
    DECLARE tag_and_aliases text;
BEGIN
    SELECT
        array_to_string(array_agg(tag), ','),
        array_to_string(array_agg(array_to_string(alias, ',')), ',')
    INTO tags_name, tag_and_aliases
    FROM taggings
             JOIN tags ON tags.id = taggings.tag_id
    where bookmark_id = new.bookmark_id;


    UPDATE bookmarks SET cached_tags_name=tags_name WHERE id=new.bookmark_id;
    UPDATE bookmarks SET cached_tags_with_alias_name=tag_and_aliases WHERE id=new.bookmark_id;
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_tagging_insert
    AFTER INSERT
    ON taggings
    FOR EACH ROW
EXECUTE PROCEDURE cache_tag_to_bookmark_on_update();

CREATE TRIGGER on_tagging_update
    AFTER UPDATE
    ON taggings
    FOR EACH ROW
EXECUTE PROCEDURE cache_tag_to_bookmark_on_update();
