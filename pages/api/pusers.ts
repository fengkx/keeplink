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
    role: z.literal('admin').or(z.literal('user')).optional(),
    settings: z.record(z.string().or(z.number())).optional(),
    api_token: z.string().uuid().optional()
  });
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json(validation.error);
    return;
  }

  const {settings, role, api_token} = validation.data;
  const data: Partial<User> = {
    settings,
    role: 'user',
    api_token
  };
  if (user.role === 'admin') {
    data.role = role;
  }

  console.log(data);
  const updated = await prisma.user.update({
    where: {id: user.id},
    data
  });
  res.status(200).json(updated);
};
