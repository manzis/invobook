// pages/_app.js

import Layout from '../components/layout';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LogoutLoader from '../components/logout'; // Import the new loader
import '../styles/globals.css';

// Create this new wrapper component
function AppContent({ Component, pageProps }) {
  // Now we can safely use the hook here
  const { isLoggingOut } = useAuth();
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <>
      {/* If isLoggingOut is true, show the loader */}
      {isLoggingOut && <LogoutLoader />}
      
      {/* Your existing layout and page logic */}
      {getLayout(<Component {...pageProps} />)}
    </>
  );
}


function MyApp({ Component, pageProps }) {
  return (
    // Wrap the AppContent component, which now contains all UI logic,
    // with the AuthProvider.
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

export default MyApp;