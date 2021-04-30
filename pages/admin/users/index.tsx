import {GetServerSideProps} from 'next';
import {supabase} from '@/db/supabase';
import {User as SupabaseUser} from '@supabase/supabase-js';
import {AdminLayout} from '@/components/AdminLayout';
import {prisma} from '@/db/prisma';
import {getPagination} from '@/utils/get-pagination';
import {useFormatTime} from '@/utils/hooks';
import Link from 'next/link';
type Props = {
  user: SupabaseUser;
  users: User[];
};
export default function AdminUsers({user, users}: Props) {
  const formatTime = useFormatTime();
  return (
    <AdminLayout userRole={user.user_metadata.role}>
      <table className="table-fixed w-full leading-loose">
        <thead>
          <tr>
            <th className="w-2/6">Email</th>
            <th className="w-1/6 hidden sm:table-cell">Provider</th>
            <th className="w-1/6">Role</th>
            <th className="w-2/6">Last Sign In</th>
            <th className="w-1/6">Actions</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td className="hidden sm:table-cell">{u.provider}</td>
              <td>{u.role}</td>
              <td>{formatTime(u.last_sign_in_at)}</td>
              <td>
                <Link href={`/admin/users/edit/${u.id}`}>
                  <a className="text-brand-800">Edit</a>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  query
}) => {
  const {user} = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {props: {}, redirect: {destination: '/signin', permanent: false}};
  }

  if (user.user_metadata.role !== 'admin') {
    return {props: {}, redirect: {destination: '/', permanent: false}};
  }

  const {page, size} = getPagination(query);
  const usersData = await prisma.$queryRaw`
        SELECT pusers.id, raw_app_meta_data as app_metadata, last_sign_in_at, email, pusers.role
        FROM auth.users
        LEFT JOIN pusers ON auth.users.id = pusers.id
        LIMIT ${size} OFFSET ${(page - 1) * size}
    `;

  const users: User[] = usersData
    .filter((u: Partial<SupabaseUser>) => u.id !== user.id)
    .map((u: Partial<SupabaseUser>) => ({
      id: u.id,
      provider: u.app_metadata?.provider,
      email: u.email,
      last_sign_in_at: Math.floor(
        new Date(u.last_sign_in_at ?? '1970-01-01 00:00:00').getTime() / 1000
      ),
      role: u.role
    }));
  return {
    props: {
      users,
      user
    }
  };
};
