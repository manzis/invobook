import { Geist, Geist_Mono } from 'next/font/google';
import Layout from '../components/layout';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LogoutLoader from '../components/logout'; // Import the new loader
import { ToastProvider } from '../context/ToastContext';
import { InventoryProvider } from '../context/InventoryContext';
import '../styles/globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

// Create this new wrapper component
function AppContent({ Component, pageProps }) {
  // Now we can safely use the hook here
  const { isLoggingOut } = useAuth();
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      {/* If isLoggingOut is true, show the loader */}
      {isLoggingOut && <LogoutLoader />}
      
      {/* Your existing layout and page logic */}
      {getLayout(<Component {...pageProps} />)}
    </div>
  );
}


function MyApp({ Component, pageProps }) {
  return (
    // Wrap the AppContent component, which now contains all UI logic,
    // with the AuthProvider.
    <AuthProvider>
      <InventoryProvider>
        <ToastProvider>
          <style dangerouslySetInnerHTML={{ __html: `
            :root {
              --font-geist-sans: ${geistSans.style.fontFamily};
              --font-geist-mono: ${geistMono.style.fontFamily};
            }
          `}} />
          <AppContent Component={Component} pageProps={pageProps} />
        </ToastProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default MyApp;