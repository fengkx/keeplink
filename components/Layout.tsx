import {Navbar} from '@/components/Navbar';
import type {user_role} from '@prisma/client';

type Props = {
  userRole: user_role;
};
export const Layout: React.FC<Props> = ({children, userRole}) => {
  return (
    <div className="container mx-auto mt-4">
      <Navbar className="mb-8" userRole={userRole} />
      <main className="application-main px-3">{children}</main>
    </div>
  );
};
