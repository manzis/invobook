// components/ui/UnderConstruction.jsx

import React from 'react';
import Link from 'next/link';
import { DraftingCompass, Wrench, ArrowLeft } from 'lucide-react';

const UnderConstruction = () => {
  return (
    <div className="ds-page flex items-center justify-center p-4">
      <div className="ds-card w-full max-w-lg text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-[var(--ds-gray-50)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <DraftingCompass
              className="w-10 h-10 text-[var(--ds-gray-500)] transform -rotate-12"
              strokeWidth={1.5}
            />
            <Wrench
              className="w-10 h-10 text-[var(--ds-gray-600)] transform rotate-12 -ml-2"
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h2 className="ds-section-title text-2xl mb-3">Under Construction</h2>

        <p className="text-base text-[var(--ds-gray-600)] max-w-sm mx-auto">
          Our team is currently crafting this feature with care. It will be available very soon.
          Thank you for your patience!
        </p>

        <div className="mt-8">
          <Link href="/dashboard" className="ds-btn-dark inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
