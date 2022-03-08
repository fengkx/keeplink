import { supabase } from '@/db/supabase';
import { apiCall } from '@/utils/api-call';
import type { Tag } from '@prisma/client';
import { User } from '@supabase/supabase-js';
import { GetServerSideProps } from 'next';
import NextLink from 'next/link';
import React, { useCallback } from 'react';
import useSWR from 'swr';

import { AdminLayout } from '@/components/AdminLayout';
import { Pagination } from '@/components/Pagination';
import { getPagination } from '@/utils/get-pagination';
import Error from 'next/error';
import { useRouter } from 'next/router';
import {
  Box,
  Flex,
  List,
  ListItem,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Link,
} from '@chakra-ui/react';

function useTagList() {
  const router = useRouter();
  const { page, size } = getPagination(router.query);
  const fetcher = useCallback(async (entry) => {
    const resp = await apiCall(entry);
    const data = await resp.json();
    return data as Tag[];
  }, []);

  const { data, error } = useSWR(
    `/api/tags?page=${page}&size=${size}&q=${router.query.q ?? ''}`,
    fetcher
  );
  return { data, error, page, size };
}

const TagsAdmin: React.FC<Props> = ({ user }) => {
  const { data, error, page, size } = useTagList();

  if (!data) {
    return (
      <AdminLayout userRole={user.user_metadata.role}>
        <Stack>
          {[...Array.from({ length: 5 }).keys()].map((key) => (
            <Box key={key} padding="6" boxShadow="lg" bg="white">
              <SkeletonCircle size="10" />
              <SkeletonText mt="4" noOfLines={4} spacing="4" />
            </Box>
          ))}
        </Stack>
      </AdminLayout>
    );
  }

  if (error) {
    return <Error title={error.message} statusCode={0} />;
  }

  return (
    <AdminLayout userRole={user.user_metadata.role}>
      <List mt={8}>
        {data.length === 0 && (
          <div className="text-center mt-4 font-semibold text-xl">
            Tags is Empty
          </div>
        )}
        {data.map((tag) => (
          <ListItem key={tag.id}>
            <Flex align='center'>
              <NextLink href={`/tag/${tag.tag}`} passHref>
                <Link flexShrink={0}>
                  {tag.tag}
                </Link>
              </NextLink>
              <Flex justify={'space-between'} flex='1'>
                <Flex ml={4} flexWrap='nowrap' align='center' width='full'>
                  {tag.alias.map((alias) => (
                    <Link
                      className="leading-relaxed bg-gray-100 m-1 px-2 py-1"
                      key={alias}
                    >
                      {alias}
                    </Link>
                  ))}
                </Flex>
                <NextLink href={`/tag/${tag.tag}/edit`} passHref>
                  <Link as={Flex} align='center' fontWeight='semibold' color='teal.400'>Edit</Link>
                </NextLink>
              </Flex>
            </Flex>
          </ListItem>
        ))}
      </List>
      <Pagination page={page} size={size} currentLen={data.length} />
    </AdminLayout>
  );
};

export default TagsAdmin;
type Props = {
  user: User;
};
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {
      props: {},
      redirect: { destination: '/signin', permanent: false },
    };
  }

  if (user.user_metadata.role !== 'admin') {
    return { props: {}, redirect: { destination: '/', permanent: false } };
  }

  return {
    props: {
      user,
    },
  };
};
