import {NextApiRequest, NextApiResponse} from 'next';
import {restful, RestfulApiHandler} from '@/utils/rest-helper';
import {getPagination} from '@/utils/get-pagination';
import {prisma} from '@/db/prisma';
import type {Prisma} from '@prisma/client';
import {getOneParamFromQuery} from '@/utils/query-param';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {read});
}

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

  if (start) {
    where.OR = where.OR ?? [];
    if (!Array.isArray(where.OR)) {
      where.OR = [where.OR];
    }

    where.OR.push({
      lower_tag: {
        startsWith: start.toLowerCase()
      }
    });
  }

  console.log(where, where.OR);
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
