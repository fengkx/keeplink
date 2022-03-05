import { supabase } from '@/db/supabase';
import { NextApiRequest, NextApiResponse } from 'next';

export default function (request: NextApiRequest, res: NextApiResponse) {
  supabase.auth.api.setAuthCookie(request, res);
}
