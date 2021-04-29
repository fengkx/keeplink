import {Layout} from '@/components/Layout';
import {GetServerSideProps} from 'next';
import {supabase} from '../../db/supabase';
import {User} from '@supabase/supabase-js';

type Props = {
  user: User;
};
export default function ({user}: Props) {
  return (
    <Layout userRole={user.user_metadata.role}>
      <div>admin/users</div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {
  const {user} = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {props: {}, redirect: {destination: '/signin', permanent: false}};
  }

  if (user.user_metadata.role !== 'admin') {
    return {props: {}, redirect: {destination: '/', permanent: false}};
  }

  return {
    props: {
      user
    }
  };
};
