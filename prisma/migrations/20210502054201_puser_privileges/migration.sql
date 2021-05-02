DROP POLICY "puser_only_self" ON pusers;

CREATE POLICY "puser_only_view_self"
    ON pusers FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "puser_not_update"
    ON pusers FOR UPDATE
    USING (false);
CREATE POLICY "puser_not_delete"
    ON pusers FOR DELETE
    USING (false);
CREATE POLICY "puser_not_insert"
    ON pusers FOR INSERT
    WITH CHECK (false);
