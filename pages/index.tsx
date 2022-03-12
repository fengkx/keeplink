import { BookmarkList } from '@/components/BookmarkList';
import { Layout } from '@/components/Layout';
import { Pagination } from '@/components/Pagination';
import QuickAdd from '@/components/QuickAdd';
import type { Tag } from '@/components/TagCloud';
import { TagCloud } from '@/components/TagCloud';
import { prisma } from '@/db/prisma';
import { supabase } from '@/db/supabase';
import { apiCall } from '@/utils/api-call';
import { getPagination } from '@/utils/get-pagination';
import { User } from '@supabase/supabase-js';
import { decode as htmlDecode } from 'he';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import useSWR from 'swr';

function useTagCloud() {
  const { data, error } = useSWR('/api/tags?tagcloud=1', async (key: string) => {
    const resp = await apiCall(key);
    return resp.json();
  });
  return {
    tags: (data ?? [].map((tag) => ({ tag }))) as Tag[],
    error,
  };
}

const Home: React.FC<Props> = ({ bookmarks, user }) => {
  const [bookmarkList, setBookmarkList] = useState(bookmarks);
  useEffect(() => {
    setBookmarkList(bookmarks);
  }, [bookmarks]);
  const { tags, error } = useTagCloud();
  const router = useRouter();
  const toast = useToast();
  if (error) {
    toast({
      description: (error.message as string) ?? 'Failed to load tagclound',
      status: 'error',
    });
  }

  const pagination = useMemo(() => getPagination(router.query), [router.query]);
  return (
    <Layout title='Bookmarks' userRole={user.user_metadata.role}>
      <div className='max-w-5xl mx-auto'>
        <QuickAdd
          onSuccess={({bookmark}) => {
            setBookmarkList([bookmark, ...bookmarkList]);
            void router.push('/', { query: '' });
          }}
        />
      </div>
      <div className='w-full lg:flex flex-row mt-6 justify-evenly lg:max-w-7xl mx-auto pb-6'>
        <section className='lg:w-2/3 xl:w-3/4 px-0 md:px-6 h-full'>
          <BookmarkList
            onDelete={(id) => {
              setBookmarkList(bookmarkList.filter((item) => item.id !== id));
            }}
            bookmarks={bookmarkList}
          />

          <Pagination
            currentLen={bookmarks.length}
            page={pagination.page}
            size={pagination.size}
          />
        </section>
        <Box as='section' className='w-1/3 max-w-sm hidden lg:block pl-6'>
          <h2 className='border-b mb-3 pb-3 font-bold'>Tags:</h2>
          <TagCloud h='full' tagList={tags ?? []} />
        </Box>
      </div>
    </Layout>
  );
};

export type BookMark = {
  created_at?: string;
  id: number;
  link_id?: number;
  title: string | null;
  description: string | null;
  url: string;
  createdAt?: Date | string | number;
  archive_stat: 'archived' | 'pending';
  tags: string[];
  cached_tags_name?: string;
};
export type Props = {
  user: User;
  bookmarks: BookMark[];
};
export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  query,
}) => {
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return { props: {}, redirect: { destination: '/signin', permanent: false } };
  }

  const { page, size } = getPagination(query);

  const data = await prisma.bookmark.findMany({
    take: size,
    skip: (page - 1) * size,
    where: {
      user_id: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      link: {
        select: {
          archive: false,
          title: true,
          description: true,
          url: true,
          id: true,
          archive_stat: true,
        },
      },
      cached_tags_name: true,
    },
  });
  const bookmarks = data.map((item) => ({
    id: item.id,
    link_id: item.link.id,
    title: item.title ?? item.link.title,
    description: htmlDecode(item.description ?? item.link.description ?? ''),
    url: item.link.url,
    createdAt: Math.floor(item.createdAt.getTime() / 1000),
    archive_stat: item.link.archive_stat,
    tags: item.cached_tags_name?.split(',') ?? [],
  }));
  return {
    props: {
      user,
      bookmarks,
    },
  };
};

export default Home;
