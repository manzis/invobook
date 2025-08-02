import Sidebar from './Sidebar/sidebar';

export default function Layout({ children }) {
  return (
    <div className="relative flex h-screen">
      <aside className="sticky top-0 w-64 h-screen overflow-y-auto bg-white border-r border-gray-200">
        <Sidebar />
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
