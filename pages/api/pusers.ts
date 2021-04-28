import {NextApiRequest, NextApiResponse} from 'next';
import {restful, RestfulApiHandler} from '@/utils/rest-helper';
import {prisma} from '@/db/prisma';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {update});
}

const update: RestfulApiHandler = async (req, res, user) => {
  const {body} = req;
  console.log(body);
  const updated = await prisma.user.update({
    where: {id: user.id},
    data: {
      settings: JSON.stringify(body)
    }
  });
  res.status(200).json(updated);
};
