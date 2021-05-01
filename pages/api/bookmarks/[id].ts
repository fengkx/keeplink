import {NextApiRequest, NextApiResponse} from 'next';
import {restful, RestfulApiHandler} from '@/utils/rest-helper';
import {prisma} from '@/db/prisma';
import {Tag} from '../../../types/model';
import {getOneParamFromQuery} from '@/utils/query-param';
import * as z from 'zod';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {update, del, read});
}

const del: RestfulApiHandler = async (req, res) => {
  const id = getOneParamFromQuery<number>(req.query, 'id');
  // https://github.com/prisma/prisma/issues/2810
  const deleted = await prisma.$executeRaw`DELETE FROM bookmarks WHERE id=${id}`;
  res.status(200).json(deleted);
};

const read: RestfulApiHandler = async (req, res) => {
  const id = getOneParamFromQuery<number>(req.query, 'id');
  const result = await prisma.bookmark.findUnique({
    where: {
      id
    }
  });
  res.status(200).json(result);
};

const update: RestfulApiHandler = async (req, res) => {
  const id = getOneParamFromQuery<number>(req.query);
  const schema = z.object({
    tags: z.array(z.string()),
    title: z.string(),
    description: z.string()
  });
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json(validation.error);
    return;
  }

  const payload = validation.data;
  if (payload.tags.length > 5) {
    res.status(400).json({error: 'too many tag'});
    return;
  }

  const alias: Array<{input: string; matches: Tag[]}> = await Promise.all(
    payload.tags.map(
      async (t: string): Promise<{input: string; matches: Tag[]}> => {
        const tags = await prisma.tag.findMany({
          where: {
            OR: [
              {
                tag: t
              },
              {
                alias: {
                  has: t
                }
              }
            ]
          }
        });
        return {input: t, matches: tags};
      }
    )
  );
  const needNewTags = alias
    .filter((t) => t.matches.length === 0)
    .map((t): string => t.input);
  const existedTags = alias
    .filter((t) => t.matches.length > 0)
    .map((t): [string, Tag[]] => [t.input, t.matches])
    .reduce((acc: Record<string, Tag[]>, cur) => {
      acc[cur[0]] = cur[1];
      return acc;
    }, {});
  const allTags = [
    ...new Set([
      ...needNewTags,
      ...Object.values(existedTags).map((t) => t[0].tag)
    ])
  ];
  await prisma.tag.createMany({
    data: needNewTags.map((tag) => ({tag})),
    skipDuplicates: true
  });
  const tagIds = (
    await prisma.tag.findMany({
      where: {
        tag: {
          in: allTags
        }
      },
      select: {
        id: true
      }
    })
  ).map((t) => t.id);
  const [updated] = await prisma.$transaction([
    prisma.bookmark.update({
      where: {
        id
      },
      data: {
        title: payload.title,
        description: payload.description,
        tags: {
          createMany: {
            data: tagIds.map((id: number) => ({tag_id: id})),
            skipDuplicates: true
          }
        }
      },
      select: {
        id: true,
        tags: {
          select: {
            tag: true
          }
        }
      }
    }),
    prisma.tagging.deleteMany({
      where: {
        tag_id: {
          notIn: tagIds
        },
        bookmark_id: id
      }
    })
  ]);
  res.status(200).json(updated);
};
