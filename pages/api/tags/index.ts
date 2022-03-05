import {NextApiRequest, NextApiResponse} from 'next';
import {restful, RestfulApiHandler} from '@/utils/rest-helper';
import {getPagination} from '@/utils/get-pagination';
import {prisma} from '@/db/prisma';
import type {Prisma} from '@prisma/client';
import {getOneParamFromQuery} from '@/utils/query-param';

const read: RestfulApiHandler = async (req, res, user) => {
  const {page, size} = getPagination(req.query);
  const {tagcloud} = req.query;
  const q = getOneParamFromQuery(req.query, 'q');
  const start = getOneParamFromQuery(req.query, 'start');
  if (tagcloud) {
    const result = await prisma.$queryRaw` select tags.tag,
                                                      count(*) as cnt
                                               from taggings
                                                        left join tags ON tags.id = taggings.tag_id
                                                        left join bookmarks ON bookmarks.id = taggings.bookmark_id
                                               where user_id = ${user.id}
                                               group by (tag)
                                               order by cnt desc
                                               offset ${
                                                 page - 1
                                               } limit ${size};`;
    res.status(200).json(result);
    return;
  }

  if (q && start) {
    const result = await prisma.$queryRaw`
            select id,
                   tag,
                   alias
            from tags
            where tag = ${q}
               or alias @> ARRAY [${q}]
               or lower_tag LIKE ${`${start}%`}
            limit ${size} offset ${(page - 1) * size}
        `;
    res.status(200).json(result);
    return;
  }

  if (start) {
    const result = await prisma.$queryRaw`
                select id,
                       tag,
                       alias
                from tags
                where lower_tag LIKE ${`${start}%`}
                limit ${size} offset ${(page - 1) * size}`;
    res.status(200).json(result);
    return;
  }

  let where: Prisma.TagWhereInput = {};
  if (q) {
    where = {
      OR: [
        {
          tag: {
            equals: q.toString()
          }
        },
        {
          alias: {
            has: q.toString()
          }
        }
      ]
    };
  }

  const result = await prisma.tag.findMany({
    take: size,
    skip: (page - 1) * size,
    where,
    select: {
      tag: true,
      id: true,
      alias: true
    }
  });
  res.status(200).json(result);
};

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {read});
}
