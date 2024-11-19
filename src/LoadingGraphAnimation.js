import React from 'react';

const LoadingGraphAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      {/* SVG Container */}
      <svg
        viewBox="0 0 240 120"
        className="w-64 h-32 mb-4"
      >
        {/* Edges with animation */}
        <g className="edges">
          <line
            x1="40" y1="60"
            x2="120" y2="30"
            stroke="#94a3b8"
            strokeWidth="2"
            className="animate-pulse"
          />
          <line
            x1="120" y1="30"
            x2="200" y2="60"
            stroke="#94a3b8"
            strokeWidth="2"
            className="animate-pulse [animation-delay:150ms]"
          />
          <line
            x1="120" y1="30"
            x2="120" y2="90"
            stroke="#94a3b8"
            strokeWidth="2"
            className="animate-pulse [animation-delay:300ms]"
          />
          <line
            x1="40" y1="60"
            x2="120" y2="90"
            stroke="#94a3b8"
            strokeWidth="2"
            className="animate-pulse [animation-delay:450ms]"
          />
          <line
            x1="200" y1="60"
            x2="120" y2="90"
            stroke="#94a3b8"
            strokeWidth="2"
            className="animate-pulse [animation-delay:600ms]"
          />
        </g>

        {/* Nodes with animation */}
        <g className="nodes">
          <circle
            cx="40" cy="60" r="8"
            fill="#3b82f6"
            className="animate-[ping_2s_ease-in-out_infinite]"
          >
          </circle>
          <circle cx="40" cy="60" r="6" fill="#2563eb" />

          <circle
            cx="120" cy="30" r="8"
            fill="#3b82f6"
            className="animate-[ping_2s_ease-in-out_infinite] [animation-delay:400ms]"
          />
          <circle cx="120" cy="30" r="6" fill="#2563eb" />

          <circle
            cx="200" cy="60" r="8"
            fill="#3b82f6"
            className="animate-[ping_2s_ease-in-out_infinite] [animation-delay:800ms]"
          />
          <circle cx="200" cy="60" r="6" fill="#2563eb" />

          <circle
            cx="120" cy="90" r="8"
            fill="#3b82f6"
            className="animate-[ping_2s_ease-in-out_infinite] [animation-delay:1200ms]"
          />
          <circle cx="120" cy="90" r="6" fill="#2563eb" />
        </g>
      </svg>

      {/* Loading Text */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-medium text-gray-700">Loading graph</span>
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  );
};

export default LoadingGraphAnimation;