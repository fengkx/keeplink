-- tags is only viewable
REVOKE UPDATE, DELETE, INSERT
    ON tags
    FROM anon, authenticated;

--- security pusers
drop policy "puser_only_view_self" on pusers;
CREATE POLICY "puser_only_self"
    ON pusers FOR ALL
    USING (auth.uid() = id);

-- check uid for taggings
ALTER TABLE taggings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tagging_only_self"
    ON taggings FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM bookmarks WHERE id=taggings.bookmark_id));

--  _prisma_migrations is private
REVOKE ALL
    ON public._prisma_migrations
FROM anon, authenticated;

-- security links table
REVOKE ALL
    ON TABLE links
FROM anon;
REVOKE DELETE,UPDATE,INSERT
ON TABLE links
FROM authenticated;
