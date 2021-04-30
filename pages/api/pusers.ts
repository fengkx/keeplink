import {NextApiRequest, NextApiResponse} from 'next';
import {restful, RestfulApiHandler} from '@/utils/rest-helper';
import {prisma} from '@/db/prisma';
import {User} from '@prisma/client';
import * as z from 'zod';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {update});
}

const update: RestfulApiHandler = async (req, res, user) => {
  const schema = z.object({
    role: z.literal('admin').or(z.literal('user')),
    settings: z.record(z.string().or(z.number()))
  });
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json(validation.error);
    return;
  }

  const {settings, role} = validation.data;
  const data: Partial<User> = {
    settings: JSON.stringify(settings),
    role: 'user'
  };
  if (user.role === 'admin') {
    data.role = role;
  }

  const updated = await prisma.user.update({
    where: {id: user.id},
    data
  });
  res.status(200).json(updated);
};
