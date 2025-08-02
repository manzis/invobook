// /pages/login.js

import React from 'react';
import AuthContainer from '../components/Login/AuthContainer';

const LoginPage = () => {
    return <AuthContainer />;
};

// This is the key!
// We are defining a custom layout function for this specific page.
// It tells _app.js: "For this page, the layout is just the page itself.
// Do NOT wrap it in the default Layout with the sidebar."
LoginPage.getLayout = function getLayout(page) {
  return <>{page}</>;
  // Using a React Fragment <> is a clean way to return the page as-is.
};

export default LoginPage;