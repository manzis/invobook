// components/Layout.jsx

// The import is correct, which is good.
import Sidebar from './Sidebar/sidebar';

export default function Layout({ children }) {
  return (
    // The main container is a flexbox to hold the sidebar and content side-by-side.
    <div className="flex h-screen bg-gray-50">
      
      {/* 
        --- THE FIX ---
        Render the Sidebar component directly. 
        DO NOT wrap it in another <aside> or add styling here.
        The Sidebar component is self-contained and handles its own styling.
      */}
      <Sidebar />

      {/* The main content area */}
      <main className="flex flex-col flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}