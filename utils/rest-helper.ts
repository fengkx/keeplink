import {NextApiRequest, NextApiResponse} from 'next';
import {supabase} from '@/db/supabase';
import type {User as SupabaseUser} from '@supabase/supabase-js';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime';
import type {User as PUser} from '@prisma/client';
import {ParsedUrlQuery} from 'querystring';
import {prisma} from '@/db/prisma';

type HttpHandler<T = any> = {
  req: NextApiRequest;
  res: NextApiResponse<T>;
};
export type User = SupabaseUser & PUser;
export type RestfulApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  user: User
) => void | Promise<void>;
type RestfulHandlerMap = {
  create: RestfulApiHandler;
  update: RestfulApiHandler;
  read: RestfulApiHandler;
  del: RestfulApiHandler;
};
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const defaultRest: RestfulHandlerMap = {
  create: noop,
  update: noop,
  read: noop,
  del: noop
};
export async function restful(
  {req, res}: HttpHandler,
  rest: Partial<RestfulHandlerMap>
) {
  const {user: supabaseUser, error} = await supabase.auth.api.getUserByCookie(
    req
  );
  if (error || !supabaseUser) {
    console.error(error);
    res.status(401).json({error: error?.message ?? 'Auth error'});
    return;
  }

  const puser = await prisma.user.findUnique({where: {id: supabaseUser.id}});
  const user: User = {...supabaseUser, ...puser!};
  const handlers: RestfulHandlerMap = {...defaultRest, ...rest};
  try {
    switch (req.method) {
      case 'POST':
        await handlers.create(req, res, user);
        break;
      case 'PUT':
        await handlers.update(req, res, user);
        break;
      case 'DELETE':
        await handlers.del(req, res, user);
        break;
      case 'GET':
        await handlers.read(req, res, user);
        break;
      default:
        res.status(405).send('Method Not Allow');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({code: error.code, reason: reason(error)});
  }
}

export type ClientSideError = 'NOT_UNIQUE' | 'UNKNOWN_ERROR';

export function reason(err: PrismaClientKnownRequestError): ClientSideError {
  switch (err.code) {
    case 'P2002':
      return 'NOT_UNIQUE';
    default:
      return 'UNKNOWN_ERROR';
  }
}

export function getIdFromQuery(query: ParsedUrlQuery): number {
  let id = query.id!;
  id = Array.isArray(id) ? id[0] : id;
  return Number.parseInt(id, 10);
}
