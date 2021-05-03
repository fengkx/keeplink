import {NextApiRequest, NextApiResponse} from 'next';
import {reason, restful, RestfulApiHandler} from '@/utils/rest-helper';
import {prisma} from '@/db/prisma';
import {decode as htmlDecode} from 'he';
import {getPagination} from '@/utils/get-pagination';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime';
import * as z from 'zod';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  await restful({req, res}, {create, read});
}

const read: RestfulApiHandler = async (req, res, user) => {
  const {size, page} = getPagination(req.query);
  const data = await prisma.bookmark.findMany({
    take: size,
    skip: (page - 1) * size,
    where: {
      user_id: user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      link: {
        select: {
          archive: false,
          title: true,
          description: true,
          url: true,
          id: true,
          archive_stat: true
        }
      },
      cached_tags_name: true
    }
  });
  const bookmarks = data.map((item) => ({
    id: item.id,
    link_id: item.link.id,
    title: item.title ?? item.link.title,
    description: htmlDecode(item.description ?? item.link.description ?? ''),
    url: item.link.url,
    createdAt: Math.floor(item.createdAt.getTime() / 1000),
    archive_stat: item.link.archive_stat,
    tags: item.cached_tags_name?.split(',') ?? []
  }));
  res.status(200).json(bookmarks);
};

const create: RestfulApiHandler = async (req, res, user) => {
  const schema = z.object({url: z.string().url()});
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json(validation.error);
    return;
  }

  const urlObj = new URL(validation.data.url);
  urlObj.hash = '';
  const url = urlObj.toString();
  try {
    const bookmark = await prisma.bookmark.create({
      data: {
        user: {
          connect: {
            id: user.id
          }
        },
        link: {
          connectOrCreate: {
            where: {
              url
            },
            create: {
              url
            }
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        tags: {
          select: {
            tag: true
          }
        },
        link: {
          select: {
            id: true,
            title: true,
            description: true,
            archive_stat: true,
            url: true
          }
        }
      }
    });
    res.status(200).json({
      user,
      bookmark: {
        id: bookmark.id,
        link_id: bookmark.link.id,
        title: bookmark.title ?? bookmark.link.title,
        description: bookmark.description ?? bookmark.link.description,
        url: bookmark.link.url,
        createdAt: Math.floor(bookmark.createdAt.getTime() / 1000),
        archive_stat: bookmark.link.archive_stat,
        tags: bookmark.tags.map((t) => t.tag)
      }
    });
    await fetch(
      `${process.env.BASE_URL}/api/links/archive/${bookmark.link.id}?bookmark=${bookmark.id}`,
      {
        method: 'POST'
      }
    );
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const link = await prisma.link.findUnique({
        where: {
          url
        },
        select: {id: true}
      });
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          bookmark_user_link_id: {
            user_id: user.id,
            link_id: link!.id
          }
        },
        select: {
          id: true
        }
      });
      res.status(400).json({
        code: error.code,
        reason: reason(error),
        data: {bookmark_id: bookmark!.id}
      });
    } else {
      throw error;
    }
  }
};
