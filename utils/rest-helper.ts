import {NextApiRequest, NextApiResponse} from 'next';
import type {User as SupabaseUser} from '@supabase/supabase-js';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime';
import type {User as PUser} from '@prisma/client';
import {supabase} from '@/db/supabase';
import {prisma} from '@/db/prisma';

type HttpHandler<T = any> = {
  req: NextApiRequest;
  res: NextApiResponse<T>;
};
export type User = SupabaseUser & PUser;
export type RestfulApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  user: User,
) => void | Promise<void>;
type RestfulHandlerMap = {
  create?: RestfulApiHandler;
  update?: RestfulApiHandler;
  read?: RestfulApiHandler;
  del?: RestfulApiHandler;
};

export const API_TOKEN_HEADER = 'x-keeplink-api-token';

export async function restful(
  {req, res}: HttpHandler,
  rest: Partial<RestfulHandlerMap>,
) {
  let user: User | undefined;
  if (req.headers[API_TOKEN_HEADER]) {
    let token = req.headers[API_TOKEN_HEADER];
    if (Array.isArray(token)) token = token[0];
    const puser = await prisma.user.findUnique({where: {api_token: token}});
    if (puser) {
      const users = await prisma.$queryRaw<
        User[]
      >`SELECT * FROM auth.users WHERE id=${puser.id}`;
      user = {...users[0], ...puser};
    }
  }

  if (!user) {
    const {user: supabaseUser, error} = await supabase.auth.api.getUserByCookie(
      req,
    );
    if (error || !supabaseUser) {
      console.error(error);
      res.status(401).json({error: error?.message ?? 'Not Auth'});
      return;
    }

    const puser = await prisma.user.findUnique({
      where: {id: supabaseUser.id},
    });
    user = {...supabaseUser, ...puser!};
  }

  const methodToHandler: Record<string, RestfulApiHandler | undefined> = {
    GET: rest.read,
    POST: rest.create,
    PUT: rest.update,
    DELETE: rest.del,
  };
  try {
    const handler = methodToHandler[req.method?.toUpperCase() ?? 'NOT'];
    if (!handler) {
      res.status(405).send('Method Not Allow');
      return;
    }

    await handler(req, res, user);
  } catch (error: any) {
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
