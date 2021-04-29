import {NextApiRequest, NextApiResponse} from 'next';
import {restful, RestfulApiHandler} from '@/utils/rest-helper';
import {prisma} from '@/db/prisma';
import {User} from '@prisma/client';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {update});
}

const update: RestfulApiHandler = async (req, res, user) => {
  const {body} = req;
  const {settings, role} = body;
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
