import Sidebar from './Sidebar/sidebar';
import TopNav from './TopNav/TopNav';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const { user, loading } = useAuth();
  const showSidebar = !loading && user;
  const router = useRouter();

  return (
    <div className="flex h-screen" style={{ background: 'var(--ds-white)' }}>
      {showSidebar && <Sidebar />}
      <main className="flex flex-col flex-1 overflow-hidden ds-page">
        {showSidebar && <TopNav />}
        <div className="flex-1 overflow-auto">
          <div key={router.asPath} className="animate-page-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

