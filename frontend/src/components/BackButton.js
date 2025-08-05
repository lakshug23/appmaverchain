import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center space-x-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="font-medium">Back</span>
    </button>
  );
};

export default BackButton; 