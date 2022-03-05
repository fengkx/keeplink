import { supabase } from '@/db/supabase';
import { NextApiRequest, NextApiResponse } from 'next';

// Example of how to verify and get user data server-side.
const getUser = async (request: NextApiRequest, res: NextApiResponse) => {
  const token = request.headers.token;

  if (typeof token === 'string') {
    const { data: user, error } = await supabase.auth.api.getUser(token);

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(200).json(user);
    return;
  }

  return res.status(400);
};

export default getUser;
