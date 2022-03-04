import {decode as htmlDecode} from 'he';
import {
  BookMark,
  getServerSideProps as noSearchServerSideProps,
} from '../index';
import {supabase} from '@/db/supabase';
import {getPagination} from '@/utils/get-pagination';
import {prisma} from '@/db/prisma';

export const getServerSideProps: typeof noSearchServerSideProps = async (
  ctx,
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
  const results = await prisma.$queryRaw<BookMark[]>`select id,
                link_id,
                title,
                description,
                created_at,
                url,
                archive_stat,
                cached_tags_name
         from (select bookmarks.id                                       as id,
                      links.id                                           as link_id,
                      COALESCE(bookmarks.title, links.title)             as title,
                      COALESCE(bookmarks.description, links.description) as description,
                      bookmarks.created_at,
                      links.url,
                      links.archive_stat,
                      bookmarks.cached_tags_name,
                      bookmarks.tsv                                      as bookmark_tsv,
                      links.tsv                                          as link_tsv
               from bookmarks
                        join links ON links.id = bookmarks.link_id
               where bookmarks.user_id = ${user?.id}
                 and (bookmarks.tsv @@ plainto_tsquery('chinese_zh', ${q})
                   or links.tsv @@ plainto_tsquery('chinese_zh', ${q}))
              ) as t1
         order by ts_rank_cd(t1.bookmark_tsv,
                          plainto_tsquery('chinese_zh', ${q})) desc ,
                  ts_rank_cd(t1.link_tsv, plainto_tsquery('chinese_zh', ${q})) desc 
         offset ${(page - 1) * size} limit ${size};
        ;
        `;
  return {
    props: {
      user,
      bookmarks: results.map((bm: BookMark) => ({
        ...bm,
        description: htmlDecode(bm.description ?? ''),
        createdAt: new Date(bm.created_at!).getTime() / 1000,
        tags: bm.cached_tags_name?.split(',') ?? [],
      })),
    },
  };
};

export {default} from '../index';
