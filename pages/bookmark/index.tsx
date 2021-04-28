import Home, {
  BookMark,
  getServerSideProps as noSearchServerSideProps
} from '../index';
import {supabase} from '@/db/supabase';
import {getPagination} from '@/utils/get-pagination';
import {prisma} from '@/db/prisma';
import {decode as htmlDecode} from 'he';

export default Home;

export const getServerSideProps: typeof noSearchServerSideProps = async (
  ctx
) => {
  const {req, query} = ctx;
  const q = query.q;
  if (!q) {
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
                                           from bookmarks
                                                    left join links ON links.id = bookmarks.link_id
                                           where bookmarks.user_id = ${user?.id}
                                               and bookmarks.tsv @@ plainto_tsquery('chinese_zh', ${q})
                                              or links.tsv @@ plainto_tsquery('chinese_zh', ${q})
                                           offset ${
                                             (page - 1) * size
                                           } limit ${size};
    `;
  return {
    props: {
      user,
      bookmarks: results.map((bm: BookMark) => ({
        ...bm,
        description: htmlDecode(bm.description ?? ''),
        createdAt: 1,
        tags: bm.cached_tags_name?.split(',') ?? []
      }))
    }
  };
};
