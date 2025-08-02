// pages/_app.js

import Layout from '../components/layout'; // Your default layout
import { AuthProvider } from '../context/AuthContext'; // Import the AuthProvider
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // Use per-page layout if defined, else default to Layout
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    // Wrap the entire application, including the layout logic, with AuthProvider.
    // This ensures that authentication state (user, loading, etc.) is available
    // everywhere, inside any layout and on any page.
    <AuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </AuthProvider>
  );
}

export default MyApp;