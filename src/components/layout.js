import Sidebar from './Sidebar/sidebar';
import TopNav from './TopNav/TopNav';
import MobileBottomNav from './MobileBottomNav';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const { user, loading } = useAuth();
  const showSidebar = !loading && user;
  const router = useRouter();

  return (
    <div className="flex h-screen" style={{ background: 'var(--ds-white)' }}>
      {showSidebar && (
        <div className="hidden md:flex flex-shrink-0">
          <Sidebar />
        </div>
      )}
      <main className="flex flex-col flex-1 overflow-hidden ds-page relative">
        {showSidebar && <TopNav />}
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          <div key={router.asPath} className="animate-page-in">
            {children}
          </div>
        </div>
      </main>
      {showSidebar && <MobileBottomNav />}
    </div>
  );
}

