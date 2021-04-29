grant usage on schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "archive_stat" AS ENUM ('pending', 'archived');

-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS zhparser;
COMMENT ON EXTENSION zhparser IS 'a parser for full-text search of Chinese';
CREATE TEXT SEARCH CONFIGURATION chinese_zh (PARSER = zhparser);
ALTER TEXT SEARCH CONFIGURATION chinese_zh ADD MAPPING FOR n,v,a,i,e,l,t WITH simple;
CREATE EXTENSION IF NOT EXISTS rum;

-- CreateTable
CREATE TABLE "bookmarks"
(
    "id"                          SERIAL       NOT NULL,
    "user_id"                     UUID         NOT NULL,
    "link_id"                     INTEGER      NOT NULL,
    "created_at"                  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"                  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title"                       TEXT,
    "description"                 TEXT,
    "cached_tags_name"            TEXT,
    "cached_tags_with_alias_name" TEXT,
    "tsv"                         tsvector GENERATED ALWAYS AS (
                                          (
                                                      setweight(
                                                              to_tsvector('public.chinese_zh'::regconfig, (COALESCE(title, ''))),
                                                              'A')
                                                      || setweight(to_tsvector('public.chinese_zh'::regconfig,
                                                                               (COALESCE(cached_tags_name, ''))), 'A')
                                                  || setweight(to_tsvector('public.chinese_zh'::regconfig,
                                                                           (COALESCE(cached_tags_with_alias_name, ''))),
                                                               'A')
                                              )
                                          || setweight(to_tsvector('public.chinese_zh'::regconfig,
                                                                   COALESCE(description, '')), 'C')
                                      ) STORED,
    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "links"
(
    "id"           SERIAL         NOT NULL,
    "url"          TEXT           NOT NULL,
    "title"        TEXT,
    "favicon"      TEXT,
    "description"  TEXT,
    "archive_stat" "archive_stat" NOT NULL DEFAULT E'pending',
    "archive"      TEXT,
    "created_at"   TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tsv"          tsvector GENERATED ALWAYS AS (
                               (setweight(to_tsvector('public.chinese_zh'::regconfig, COALESCE(title, '')), 'A')
                                   || setweight(to_tsvector('public.chinese_zh'::regconfig, COALESCE(url, '')), 'A'))
                               || setweight(to_tsvector('public.chinese_zh'::regconfig, COALESCE(description, '')), 'B')
                           || setweight(to_tsvector('public.chinese_zh'::regconfig, COALESCE(archive, '')), 'D')
                       ) STORED,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pusers"
(
    "id"       UUID        NOT NULL,
    "role"     "user_role" NOT NULL DEFAULT E'user',
    "settings" JSONB       NOT NULL DEFAULT E'{}',

    PRIMARY KEY ("id")
);
alter table pusers
    enable row level security;
create policy "puser_only_view_self"
    on pusers for select
    using (auth.uid() = id);

-- inserts a row into public.users
create or replace function public.handle_new_user()
    returns trigger as
$$
begin
    if exists(select id from public.pusers limit 1) then
        insert into public.pusers (id)
        values (new.id);
        return new;
    else
        insert into public.pusers ("id", "role")
        values (new.id, 'admin'::user_role);
        return new;
    end if;
end;
$$ language plpgsql security definer;

-- trigger the function every time a user is created
create trigger on_auth_user_created
    after insert
    on auth.users
    for each row
execute procedure public.handle_new_user();

-- update user
create or replace function public.handle_user_setting()
    returns trigger as
$$
begin
    update auth.users
    set raw_user_meta_data=new.settings || jsonb_build_object('role', new.role::user_role)
    where id = new.id;
    return new;
end;
$$ language plpgsql security definer;

-- trigger the function every time user setting updated
create trigger on_user_setting_updated
    after update
    on pusers
    for each row
execute procedure public.handle_user_setting();

-- trigger the function every time user setting updated
create trigger on_user_setting_insert
    after insert
    on pusers
    for each row
execute procedure public.handle_user_setting();


-- CreateTable
CREATE TABLE "tags"
(
    "id"    SERIAL NOT NULL,
    "tag"   TEXT   NOT NULL,
    "alias" TEXT[],

    PRIMARY KEY ("id")
);
REVOKE UPDATE, DELETE
ON tags
FROM anon, authenticated;

-- CreateTable
CREATE TABLE "taggings"
(
    "id"          SERIAL  NOT NULL,
    "tag_id"      INTEGER NOT NULL,
    "bookmark_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookmark_user_link_id" ON "bookmarks" ("user_id", "link_id");

-- CreateIndex
CREATE INDEX "link_id" ON "bookmarks" ("link_id");

-- CreateIndex
CREATE UNIQUE INDEX "links.url_unique" ON "links" ("url");

-- CreateIndex
CREATE UNIQUE INDEX "tags.tag_unique" ON "tags" ("tag");

-- CreateIndex
CREATE UNIQUE INDEX "tag_bookmark_id" ON "taggings" ("tag_id", "bookmark_id");

-- CreateIndex
CREATE INDEX "bookmark_tsv_search" ON "bookmarks" USING rum ("tsv");

-- CreateIndex
CREATE INDEX "link_tsv_search" ON "links" USING rum ("tsv");


-- AddForeignKey
ALTER TABLE "bookmarks"
    ADD FOREIGN KEY ("link_id") REFERENCES "links" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks"
    ADD FOREIGN KEY ("user_id") REFERENCES "pusers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taggings"
    ADD FOREIGN KEY ("bookmark_id") REFERENCES "bookmarks" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taggings"
    ADD FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

/**
 * REALTIME SUBSCRIPTIONS
 * Only allow realtime listening on public tables.
 */

begin;
-- remove the realtime publication
drop publication if exists supabase_realtime;

-- re-create the publication but don't enable it for any tables
create publication supabase_realtime;
commit;

-- add tables to the publication
alter publication supabase_realtime add table bookmarks;
alter publication supabase_realtime add table links;
alter publication supabase_realtime add table tags;
