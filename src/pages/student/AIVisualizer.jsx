import React from 'react';
import { Loader2 } from 'lucide-react';

const AIVisualizer = ({ state }) => {
  // state can be: 'idle', 'listening', 'thinking', 'speaking'
  
  return (
    <div className="flex flex-col items-center justify-center p-8 h-64 w-full relative">
      {/* The Core Orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer glowing rings */}
        <div className={`absolute w-32 h-32 rounded-full blur-xl transition-all duration-700 ${
          state === 'speaking' ? 'bg-[#FF4A1F] scale-150 opacity-50 animate-pulse' :
          state === 'thinking' ? 'bg-blue-500 scale-125 opacity-40 animate-spin' :
          state === 'listening' ? 'bg-green-500 scale-110 opacity-40' :
          'bg-gray-700 scale-100 opacity-20'
        }`}></div>
        
        {/* Inner solid orb */}
        <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
          state === 'speaking' ? 'bg-gradient-to-br from-[#FF4A1F] to-orange-400 scale-110' :
          state === 'thinking' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' :
          state === 'listening' ? 'bg-gradient-to-br from-green-500 to-emerald-400 shadow-[0_0_30px_rgba(34,197,94,0.5)]' :
          'bg-gray-800 border-2 border-gray-600'
        }`}>
          {state === 'thinking' && <Loader2 className="text-white animate-spin w-8 h-8" />}
          {state === 'listening' && <div className="flex gap-1 items-center justify-center h-8">
              <div className="w-1.5 h-full bg-white rounded-full animate-[bounce_1s_infinite]"></div>
              <div className="w-1.5 h-3/4 bg-white rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
              <div className="w-1.5 h-full bg-white rounded-full animate-[bounce_1s_infinite_0.4s]"></div>
          </div>}
        </div>
      </div>
      
      <p className="mt-8 text-gray-400 font-medium tracking-widest uppercase text-sm">
        {state === 'speaking' ? 'AI is speaking...' :
         state === 'thinking' ? 'AI is analyzing...' :
         state === 'listening' ? 'Listening to you...' :
         'Ready'}
      </p>
    </div>
  );
};

export default AIVisualizer;