import { ParsedUrlQuery } from 'querystring';

export function getOneParamFromQuery<T = string>(
  query: ParsedUrlQuery,
  key = 'id',
): T {
  let param = query[key];
  if (!param) return '' as unknown as T;
  param = Array.isArray(param) ? param[0] : param;
  if (/^\d+$/.test(param)) {
    return Number.parseInt(param, 10) as unknown as T;
  }

  return param as unknown as T;
}
