import Home, {
  BookMark,
  getServerSideProps as noSearchServerSideProps
} from '@/pages/index';
import {supabase} from '@/db/supabase';
import {getPagination} from '@/utils/get-pagination';
import {prisma} from '@/db/prisma';
import {decode as htmlDecode} from 'he';

export default Home;
export const getServerSideProps: typeof noSearchServerSideProps = async (
  ctx
) => {
  const {req, query} = ctx;
  const tagName = Array.isArray(query.tagName)
    ? query.tagName[0]
    : query.tagName;
  if (!tagName) {
    return noSearchServerSideProps(ctx);
  }

  const {user} = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {props: {}, redirect: {destination: '/signin', permanent: false}};
  }

  const {page, size} = getPagination(query);

  const results = await prisma.$queryRaw`select bookmarks.id,
                bookmarks.link_id,
                COALESCE(bookmarks.title, links.title)             as title,
                COALESCE(bookmarks.description, links.description) as description,
                bookmarks.created_at,
                links.url,
                links.archive_stat,
                bookmarks.cached_tags_name
         from taggings
                  left join tags ON tags.id = taggings.tag_id
                  left join bookmarks ON bookmarks.id = taggings.bookmark_id
                  left join links ON links.id = bookmarks.link_id
         where tags.tag = ${tagName}
         order by bookmarks.created_at desc 
         offset ${(page - 1) * size}
         limit ${size}`;
  const bookmarks = results.map((bm: BookMark) => ({
    ...bm,
    description: htmlDecode(bm.description ?? ''),
    createdAt: Math.floor(new Date(bm.created_at!).getTime() / 1000),
    tags: bm.cached_tags_name?.split(',') ?? []
  }));
  return {
    props: {
      user,
      bookmarks
    }
  };
};
