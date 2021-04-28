import {NextApiRequest, NextApiResponse} from 'next';
import {supabase} from '@/db/supabase';

export default function (request: NextApiRequest, res: NextApiResponse) {
  supabase.auth.api.setAuthCookie(request, res);
}
