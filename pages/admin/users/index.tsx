import { AdminLayout } from '@/components/AdminLayout';
import { prisma } from '@/db/prisma';
import { supabase } from '@/db/supabase';
import { getPagination } from '@/utils/get-pagination';
import { useFormatTime } from '@/utils/hooks';
import { Table, Tbody, Td, Th, Thead, Tr, Link} from '@chakra-ui/react';
import { user_role } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { GetServerSideProps } from 'next';
import NextLink from 'next/link';

type Props = {
  user: SupabaseUser;
  users: User[];
};
export default function AdminUsers({ user, users }: Props) {
  const formatTime = useFormatTime();
  return (
    <AdminLayout userRole={user.user_metadata.role}>
      <Table mt={9}>
        <Thead>
          <Tr>
            <Th >Email</Th>
            <Th display={['none', 'table-cell']}>Provider</Th>
            <Th >Role</Th>
            <Th >Last Sign In</Th>
            <Th >Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((u) => (
            <Tr key={u.id}>
              <Td>{u.email}</Td>
              <Td display={['none', 'table-cell']}>{u.provider}</Td>
              <Td>{u.role}</Td>
              <Td>{formatTime(u.last_sign_in_at)}</Td>
              <Td>
                <NextLink href={`/admin/users/edit/${u.id}`} passHref>
                  <Link color='teal'>Edit</Link>
                </NextLink>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </AdminLayout>
  );
}

type User = {
  id: string;
  provider: string;
  email: string;
  last_sign_in_at: number;
  role: string;
};
export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  query,
}) => {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return { props: {}, redirect: { destination: '/signin', permanent: false } };
  }

  if (user.user_metadata.role !== 'admin') {
    return { props: {}, redirect: { destination: '/', permanent: false } };
  }

  const { page, size } = getPagination(query);
  const usersData = await prisma.$queryRaw<SupabaseUser[]>`
        SELECT pusers.id, raw_app_meta_data as app_metadata, last_sign_in_at, email, pusers.role
        FROM pusers
        LEFT JOIN auth.users ON auth.users.id = pusers.id
        LIMIT ${size} OFFSET ${(page - 1) * size}
    `;

  // @ts-expect-error provider can be empty
  const users: User[] = usersData
    .filter((u: SupabaseUser) => u.id !== user.id)
    .map((u: SupabaseUser) => ({
      id: u.id,
      provider: u.app_metadata?.provider,
      email: u.email!,
      last_sign_in_at: Math.floor(
        new Date(u.last_sign_in_at ?? '1970-01-01 00:00:00').getTime() / 1000,
      ),
      role: u.role as user_role,
    }));
  return {
    props: {
      users,
      user,
    },
  };
};
