
import React from "react";

interface FancyLoaderProps {
  message?: string;
}

export const FancyLoader: React.FC<FancyLoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="mt-4 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
        OstéoPraxis
      </span>
      {message && (
        <p className="mt-2 text-muted-foreground text-center">
          {message}
        </p>
      )}
    </div>
  );
};
