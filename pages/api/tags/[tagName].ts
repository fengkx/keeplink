import {NextApiRequest, NextApiResponse} from 'next';
import {
  restful,
  RestfulApiHandler
} from '@/utils/rest-helper';
import {prisma} from '@/db/prisma';
import {getOneParamFromQuery} from "@/utils/query-param";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {update});
}

const update: RestfulApiHandler = async (req, res) => {
  const tagName = getOneParamFromQuery(req.query, 'tagName');
  const payload = req.body;

  const updated = await prisma.tag.upsert({
    where: {
      tag: tagName.toString()
    },
    create: payload,
    update: payload
  });
  res.status(200).json(updated);
};
