// components/Layout.jsx
import Sidebar from './Sidebar/sidebar';
import { useAuth } from '../context/AuthContext'; // Assuming you have a useAuth hook

export default function Layout({ children }) {
  const { user, loading } = useAuth();

  // Only show the sidebar if the authentication check is complete and there is a user
  const showSidebar = !loading && user;

  return (
    <div className="flex h-screen bg-gray-50">
      {showSidebar && <Sidebar />}
      <main className="flex flex-col flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}