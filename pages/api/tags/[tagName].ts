import {NextApiRequest, NextApiResponse} from 'next';
import {restful, RestfulApiHandler} from '@/utils/rest-helper';
import {prisma} from '@/db/prisma';
import {getOneParamFromQuery} from '@/utils/query-param';
import * as z from 'zod';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {update});
}

const update: RestfulApiHandler = async (req, res) => {
  const tagName = getOneParamFromQuery(req.query, 'tagName');
  const schema = z.object({
    tag: z.string(),
    alias: z.array(z.string())
  });
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json(validation.error);
    return;
  }

  const updated = await prisma.tag.upsert({
    where: {
      tag: tagName.toString()
    },
    create: validation.data,
    update: validation.data
  });
  res.status(200).json(updated);
};
