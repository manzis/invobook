// components/ui/UnderConstruction.jsx

import React from 'react';
import Link from 'next/link';
import { DraftingCompass, Wrench, ArrowLeft } from 'lucide-react';

const UnderConstruction = () => {
  return (
    // Main container to center the content on the page
    <div className="flex-1 flex items-center justify-center bg-slate-50 p-4">
      
      {/* The content card */}
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-sm">
        
        {/* Engaging Icon Element */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-100 rounded-full opacity-70"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <DraftingCompass className="w-10 h-10 text-blue-500 transform -rotate-12" strokeWidth={1.5} />
            <Wrench className="w-10 h-10 text-blue-600 transform rotate-12 -ml-2" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Under Construction
        </h2>

        {/* Informative Message */}
        <p className="text-slate-500 max-w-sm mx-auto">
          Our team is currently crafting this feature with care. It will be available very soon. Thank you for your patience!
        </p>

        {/* Call-to-Action Button */}
        <div className="mt-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg
                       transition-all duration-200 ease-in-out
                       hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default UnderConstruction;