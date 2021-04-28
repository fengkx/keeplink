-- RenameBookTag
ALTER TABLE "bookmark_tag" RENAME TO taggings;
-- Rename sequence
ALTER SEQUENCE bookmark_tag_id_seq RENAME TO taggings_id_seq;

-- RenameConstraint
ALTER TABLE taggings RENAME CONSTRAINT "bookmark_tag_bookmark_id_fkey" TO "taggings_bookmark_id_fkey";
ALTER TABLE taggings RENAME CONSTRAINT "bookmark_tag_tag_id_fkey" TO "taggings_tag_id_fkey";
