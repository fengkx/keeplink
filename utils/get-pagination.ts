import type { ParsedUrlQuery } from 'querystring';

export function getPagination(query: ParsedUrlQuery) {
  let page = query.page ?? '1';
  let size = query.size ?? '50';
  if (Array.isArray(page)) page = page[0];
  if (Array.isArray(size)) size = size[0];

  return {
    page: Number.parseInt(page, 10),
    size: Number.parseInt(size, 10),
  };
}
