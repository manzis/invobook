// /components/LogoutLoader.js

import React from 'react';
const LogoutLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--ds-white)]">
      <div className="flex flex-col items-center gap-6">
        <div className="ds-spinner w-12 h-12" role="status" aria-label="Logging out" />
        <p className="text-2xl font-semibold tracking-wide text-[var(--ds-black)]">
          Logging Out...
        </p>
      </div>
    </div>
  );
};

export default LogoutLoader;
