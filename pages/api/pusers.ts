import { prisma } from '@/db/prisma';
import { restful, RestfulApiHandler } from '@/utils/rest-helper';
import { User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import * as z from 'zod';

const update: RestfulApiHandler = async (req, res, user) => {
  const schema = z.object({
    role: z.literal('admin').or(z.literal('user')).optional(),
    settings: z.record(z.string().or(z.number())).optional(),
    api_token: z.string().uuid().optional(),
  });
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json(validation.error);
    return;
  }

  const { settings, role, api_token: apiToken } = validation.data;
  const data: Partial<User> & { api_token?: string } = {
    settings,
    role: 'user',
    api_token: apiToken,
  };
  if (user.role === 'admin') {
    data.role = role;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    // @ts-expect-error null is not inputJSONValue
    data,
  });
  res.status(200).json(updated);
};

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({ req, res }, { update });
}
