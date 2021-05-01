import {NextApiRequest, NextApiResponse} from 'next';
import metaParser from 'metascraper';
import metascraperUrl from 'metascraper-url';
import metascraperDescription from 'metascraper-description';
import metascraperTitle from 'metascraper-title';
import execa from 'execa';
import {restful, RestfulApiHandler} from '@/utils/rest-helper';
import {prisma} from '@/db/prisma';
import {getOneParamFromQuery} from '@/utils/query-param';

const metascraper = metaParser([
  metascraperUrl(),
  metascraperDescription(),
  metascraperTitle()
]);

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return restful({req, res}, {create, read});
}

const create: RestfulApiHandler = async (req, res) => {
  const id = getOneParamFromQuery<number>(req.query);
  const link = await prisma.link.findUnique({
    where: {id}
  });
  if (!link) {
    res.status(404).json({error: 'link not found'});
    return;
  }

  const url = link.url;
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

    updated.archive_stat = 'archived';
    updated.archive = singlePage;
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
              where bookmarks.id = 1
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
