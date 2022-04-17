import { Layout } from '@/components/Layout';
import { HStack, Link } from '@chakra-ui/react';
import type { user_role } from '@prisma/client';
import NextLink from 'next/link';
import React from 'react';

type Props = {
  userRole: user_role;
};
export const AdminLayout: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  userRole,
}) => {
  return (
    <Layout userRole={userRole}>
      <HStack spacing={8} maxW={['xs', 'sm', '2xl', '5xl']} mx='auto' mb={2}>
        <NextLink href='/admin/users' passHref>
          <Link fontWeight={'semibold'} color='teal'>Users</Link>
        </NextLink>
        <NextLink href='/admin/tags' passHref>
          <Link fontWeight={'semibold'} color='teal'>Tags</Link>
        </NextLink>
      </HStack>
      <div className='max-w-4xl mx-auto'>{children}</div>
    </Layout>
  );
};
