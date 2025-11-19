import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingBook: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-amber-900">
      <div className="animate-bounce mb-8">
        <div className="w-16 h-20 bg-amber-800 rounded-r-md rounded-l-sm shadow-xl flex items-center justify-center border-l-4 border-amber-900">
            <div className="w-12 h-16 bg-amber-100 opacity-20"></div>
        </div>
      </div>
      <h2 className="text-3xl font-serif mb-4">Weaving your story...</h2>
      <p className="text-xl text-amber-800/70 text-center max-w-md animate-pulse">
        Gemini is analyzing your memories, sketching illustrations, and preparing the ink.
      </p>
      <Loader2 className="w-8 h-8 mt-8 animate-spin text-amber-900" />
    </div>
  );
};

export default LoadingBook;