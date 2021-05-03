import {NextApiRequest, NextApiResponse} from 'next';
import execa from 'execa';
import {restful, RestfulApiHandler} from '@/utils/rest-helper';
import {prisma} from '@/db/prisma';
import {getOneParamFromQuery} from '@/utils/query-param';
import UserAgent from 'user-agents';
import {Link} from '@prisma/client';
import {metascraper} from '@/utils/metascraper';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime';

interface Metadata {
  author: string;
  date: string;
  description: string;
  image: string;
  publisher: string;
  title: string;
  url: string;
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {create, read});
}

function extractUpdate(
  metadata: Metadata,
  link: Link,
  url: string,
  html: string
) {
  metadata.url = new URL(metadata.url).toString(); // Normalize url
  const updated: Partial<typeof link> = {};
  if (!link.title) {
    updated.title = metadata.title;
  }

  if (!link.description) {
    updated.description = metadata.description;
  }

  if (url !== metadata.url) {
    updated.url = metadata.url;
  }

  updated.archive = html;
  return updated;
}

const create: RestfulApiHandler = async (req, res, user) => {
  const id = getOneParamFromQuery<number>(req.query);
  const link = await prisma.link.findUnique({
    where: {id}
  });

  if (!link) {
    res.status(404).json({error: 'link not found'});
    return;
  }

  const url = link.url;
  try {
    const resp = await fetch(url, {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        Host: new URL(url).host,
        'user-agent': new UserAgent({deviceCategory: 'desktop'}).toString()
      }
    });
    if (resp.ok) {
      const html = await resp.text();
      const metadata = await metascraper({html, url});
      const updated = extractUpdate(metadata, link, url, html);

      try {
        await prisma.link.update({
          where: {id: link.id},
          data: updated
        });
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          ((error.meta as unknown) as any)?.target?.includes('url')
        ) {
          const existedLink = await prisma.link.findUnique({
            where: {url: updated.url},
            select: {id: true}
          });
          await prisma.$transaction([
            prisma.bookmark.update({
              where: {
                bookmark_user_link_id: {
                  user_id: user.id,
                  link_id: id
                }
              },
              data: {link_id: existedLink!.id}
            }),
            prisma.link.delete({where: {id}})
          ]);
          res.status(200).json({redirect_link_id: existedLink!.id});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }

  console.log('archive', url);
  try {
    const {stdout: singlePage, failed, stderr} = await execa('npx', [
      'single-file',
      url,
      '--browser-server',
      process.env.CHROME_WS_URL!,
      '--dump-content'
    ]);
    if (failed || stderr.length > 0) {
      res.status(500).json({error: stderr});
      return;
    }

    const metadata = await metascraper({html: singlePage, url});
    res.status(200).json({metadata, html: singlePage});
    const updated = extractUpdate(metadata, link, url, singlePage);
    updated.archive_stat = 'archived';

    await prisma.link.update({
      where: {id: link.id},
      data: updated
    });
    const bookmarkId = getOneParamFromQuery<number>(req.query, 'bookmark');
    if (bookmarkId) {
      const suggestedTags: Array<{
        tag: string;
        tag_id: number;
      }> = await prisma.$queryRaw`
        select tag,
               tag_id
        from (select distinct tags.tag,
                              tags.id                        as tag_id,
                              tags.tsq                       as tsq,
                              bookmarks.tsv                  as bookmarks_tsv,
                              links.tsv                      as links_tsv,
                              ts_rank_cd(links.tsv, tsq)     as link_score,
                              ts_rank_cd(bookmarks.tsv, tsq) as bookmark_score

              from tags,
                   bookmarks
                     join links ON links.id = bookmarks.link_id
              where bookmarks.id = ${bookmarkId}
                and (
                  bookmarks.tsv @@ tags.tsq
                  or
                  links.tsv @@ tags.tsq
                )
                and (ts_rank_cd(links.tsv, tsq) + ts_rank_cd(bookmarks.tsv, tsq) > 1)
             ) as t1
        order by ts_rank_cd(bookmarks_tsv, tsq) desc,
                 ts_rank_cd(links_tsv, tsq) desc
        limit 5;
        ;
      `;
      await prisma.tagging.createMany({
        data: suggestedTags.map((t) => {
          return {
            tag_id: t.tag_id,
            bookmark_id: bookmarkId
          };
        }),
        skipDuplicates: true
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({error: error.message});
  }
};

const read: RestfulApiHandler = async (req, res) => {
  const id = getOneParamFromQuery<number>(req.query);
  const link = await prisma.link.findUnique({
    where: {
      id
    },
    select: {
      archive: true,
      archive_stat: true
    }
  });
  if (!link) {
    res.status(404).send('link not found');
  } else if (link.archive_stat === 'pending') {
    res.status(200).send('');
  } else {
    res.setHeader('content-type', 'text/html');
    res.status(200).send(link.archive);
  }
};
