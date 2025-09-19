// /components/LogoutLoader.js

import React from 'react';
import { Building2 } from 'lucide-react'; // Import your chosen icon

const LogoutLoader = () => {
  return (
    // Main overlay: Changed to a solid, branded blue background
    <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center z-50">
      
      {/* Container for your logo and text to keep them grouped nicely */}
      <div className="flex flex-col items-center">

        {/* The Spinning Logo */}
        <Building2 className="w-16 h-16 text-white animate-spin" />

        {/* The Text */}
        <p className="text-white text-2xl mt-6 font-semibold tracking-wider">
          Logging Out...
        </p>

      </div>
    </div>
  );
};

export default LogoutLoader;