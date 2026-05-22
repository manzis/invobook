import Sidebar from './Sidebar/sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, loading } = useAuth();
  const showSidebar = !loading && user;

  return (
    <div className="flex h-screen" style={{ background: 'var(--ds-white)' }}>
      {showSidebar && <Sidebar />}
      <main className="flex flex-col flex-1 overflow-hidden ds-page">{children}</main>
    </div>
  );
}
