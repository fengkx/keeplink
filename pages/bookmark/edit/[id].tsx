import { Layout } from '@/components/Layout';
import { prisma } from '@/db/prisma';
import { supabase } from '@/db/supabase';
import type { Tag } from '@prisma/client';
import { User } from '@supabase/supabase-js';
import { decode as decodeHtml } from 'he';
import { GetServerSideProps } from 'next';
import Error from 'next/error';
import React from 'react';
import { Form } from './form';

const Edit: React.FC<Props> = ({ bookmark, user }) => {
  if (!bookmark) {
    return <Error statusCode={404} />;
  }

  return (
    <Layout userRole={user.user_metadata.role}>
      <Form bookmark={bookmark} maxW='3xl' mx={'auto'} />
    </Layout>
  );
};

export type Props = {
  user: User;
  bookmark?: {
    id: number;
    user_id: string;
    link_id: number;
    createdAt: number;
    title: string | null;
    description: string | null;
    url: string;
    tags: Array<Partial<Tag>>;
  };
};
type Query = {
  id: string;
};
export const getServerSideProps: GetServerSideProps<Props, Query> = async ({
  req,
  params,
}) => {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  const id = Number.parseInt(params!.id, 10);
  if (!user) {
    return { props: {}, redirect: { destination: '/signin', permanent: false } };
  }

  const data = await prisma.bookmark.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      user_id: true,
      link_id: true,
      title: true,
      description: true,
      createdAt: true,
      link: {
        select: {
          title: true,
          url: true,
          description: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              tag: true,
            },
          },
        },
      },
    },
  });
  if (data) {
    const bookmark = {
      id: data.id,
      user_id: data.user_id,
      link_id: data.link_id,
      createdAt: data.createdAt.getTime() / 1000,
      title: data.title ?? data.link.title,
      description: decodeHtml(data.description ?? data.link.description ?? ''),
      url: data.link.url,
      tags: data.tags.map((t) => ({ tag: t.tag.tag, id: t.tag.id })),
    };
    return {
      props: {
        user,
        bookmark,
      },
    };
  }

  return {
    props: { user },
  };
};

export default Edit;
