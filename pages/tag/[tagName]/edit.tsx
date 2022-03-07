import { Layout } from '@/components/Layout';
import { prisma } from '@/db/prisma';
import { supabase } from '@/db/supabase';

import { GetServerSideProps } from 'next';
import type { Tag } from '@prisma/client';
import { User } from '@supabase/supabase-js';
import Error from 'next/error';
import { Form } from '@/components/Forms/tag-edit';

const Edit: React.FC<Props> = ({ tag, user }) => {
  if (!tag) {
    return <Error statusCode={404} />;
  }

  return (
    <Layout userRole={user.user_metadata.role}>
      <Form tag={tag} maxW='lg' mx='auto' mt='8' />
    </Layout>
  );
};

type Props = {
  user: User;
  tag?: Tag;
};
type Query = {
  id: string;
};
export const getServerSideProps: GetServerSideProps<Props, Query> = async (
  ctx,
) => {
  const { req, query } = ctx;
  const { user } = await supabase.auth.api.getUserByCookie(req);
  const tagName = Array.isArray(query.tagName)
    ? query.tagName[0]
    : query.tagName;
  if (!user) {
    return { props: {}, redirect: { destination: '/signin', permanent: false } };
  }

  const tag = await prisma.tag.findUnique({
    where: {
      tag: tagName,
    },
  });
  if (tag) {
    return {
      props: {
        user,
        tag,
      },
    };
  }

  return {
    props: { user },
  };
};

export default Edit;
