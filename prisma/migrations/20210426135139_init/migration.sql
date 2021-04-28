-- CreateEnum
CREATE TYPE "archive_stat" AS ENUM ('pending', 'archived');

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "link_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "links" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "favicon" TEXT,
    "description" TEXT,
    "archive_stat" "archive_stat" NOT NULL DEFAULT E'pending',
    "archive" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

CREATE TYPE "user_role" AS ENUM ('admin', 'user');
-- CreateTable
CREATE TABLE "pusers" (
    "id" UUID NOT NULL,
    "role" "user_role" NOT NULL DEFAULT E'user',
    "settings" JSONB NOT NULL DEFAULT E'{}',

    PRIMARY KEY ("id")
);
-- CreateEnum

-- AlterTable

-- inserts a row into public.users
create function public.handle_new_user()
    returns trigger as $$
begin
    insert into public.pusers (id)
    values (new.id);
    return new;
end;
$$ language plpgsql security definer;

-- trigger the function every time a user is created
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "alias" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmark_tag" (
    "id" SERIAL NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "bookmark_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookmark_user_link_id" ON "bookmarks"("user_id", "link_id");

-- CreateIndex
CREATE INDEX "link_id" ON "bookmarks"("link_id");

-- CreateIndex
CREATE UNIQUE INDEX "links.url_unique" ON "links"("url");

-- CreateIndex
CREATE UNIQUE INDEX "tags.tag_unique" ON "tags"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "unique_tag_to_bookmark" ON "bookmark_tag"("tag_id", "bookmark_id");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD FOREIGN KEY ("user_id") REFERENCES "pusers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_tag" ADD FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_tag" ADD FOREIGN KEY ("bookmark_id") REFERENCES "bookmarks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
