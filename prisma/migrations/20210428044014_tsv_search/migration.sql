CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS zhparser;
COMMENT ON EXTENSION zhparser IS 'a parser for full-text search of Chinese';
CREATE TEXT SEARCH CONFIGURATION chinese_zh (PARSER = zhparser) ;
ALTER TEXT SEARCH CONFIGURATION chinese_zh ADD MAPPING FOR n,v,a,i,e,l,t WITH simple;
CREATE EXTENSION IF NOT EXISTS rum;

-- AlterTable
ALTER TABLE bookmarks
    ADD COLUMN "cached_tags_name" TEXT,
    ADD COLUMN     "cached_tags_with_alias_name" TEXT;

ALTER TABLE "bookmarks"
    ADD COLUMN "tsv" tsvector
        GENERATED ALWAYS AS (
                (
                        setweight(to_tsvector('public.chinese_zh'::regconfig, (COALESCE(title, ''))), 'A')
                        || setweight(to_tsvector('public.chinese_zh'::regconfig, (COALESCE(cached_tags_name, ''))), 'A')
                        || setweight(to_tsvector('public.chinese_zh'::regconfig, (COALESCE(cached_tags_with_alias_name, ''))), 'A')
                    )
                || setweight(to_tsvector('public.chinese_zh'::regconfig, COALESCE(description, '')), 'C')
            ) STORED;

-- AlterTable
ALTER TABLE "links"
    ADD COLUMN "tsv" tsvector
        GENERATED ALWAYS AS (
                    (setweight(to_tsvector('public.chinese_zh'::regconfig, COALESCE(title, '')), 'A')
                        || setweight(to_tsvector('public.chinese_zh'::regconfig, COALESCE(url, '')), 'A'))
                    || setweight(to_tsvector('public.chinese_zh'::regconfig, COALESCE(description, '')), 'B')
                || setweight(to_tsvector('public.chinese_zh'::regconfig, COALESCE(archive, '')), 'D')
            ) STORED;

-- CreateIndex
CREATE INDEX "bookmark_tsv_search" ON "bookmarks" USING rum("tsv");

-- CreateIndex
CREATE INDEX "link_tsv_search" ON "links" USING rum("tsv");

-- AlterIndex
ALTER INDEX "unique_tag_to_bookmark" RENAME TO "tag_bookmark_id";
