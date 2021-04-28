import {NextApiRequest, NextApiResponse} from 'next';
import {restful, RestfulApiHandler} from '@/utils/rest-helper';
import {getPagination} from '@/utils/get-pagination';
import {prisma} from '@/db/prisma';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {read});
}

const read: RestfulApiHandler = async (req, res, user) => {
  const {page, size} = getPagination(req.query);
  const result = await prisma.$queryRaw` select tags.tag,
                                                  count(*) as cnt
                                           from taggings
                                                    left join tags ON tags.id = taggings.tag_id
                                                    left join bookmarks ON bookmarks.id = taggings.bookmark_id
                                            where user_id=${user.id}
                                           group by (tag)
                                           order by cnt desc
                                           offset ${page - 1} limit ${size};`;
  res.status(200).json(result);
};
