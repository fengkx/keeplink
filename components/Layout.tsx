import {Navbar} from '@/components/Navbar';

export const Layout: React.FC = ({children}) => {
  return (
    <div className="container mx-auto mt-4">
      <Navbar className="mb-8" />
      <main className="application-main px-3">{children}</main>
    </div>
  );
};
