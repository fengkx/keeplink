import { prisma } from '@/db/prisma';
import { getOneParamFromQuery } from '@/utils/query-param';
import { restful, RestfulApiHandler } from '@/utils/rest-helper';
import { NextApiRequest, NextApiResponse } from 'next';
import * as z from 'zod';

const update: RestfulApiHandler = async (req, res, user) => {
  const uid = getOneParamFromQuery(req.query, 'uid');

  if (user.user_metadata.role !== 'admin') {
    res.status(401).json({ error: 'Not Auth' });
    return;
  }

  const schema = z.object({
    role: z.literal('user').or(z.literal('admin')),
  });
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json(validation.error);
    return;
  }

  const { role } = validation.data;
  const updated = await prisma.user.update({
    where: {
      id: uid,
    },
    data: {
      role,
    },
  });
  res.status(200).json(updated);
};

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({ req, res }, { update });
}
