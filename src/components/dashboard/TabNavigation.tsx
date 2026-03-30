import React from "react";

export const TabNavigation: React.FC = () => {
  return (
    <div className="w-[97%] mx-auto border-b border-gray-200 mb-4 sm:mb-6">
      <h2 className="py-2 sm:py-3 text-xs sm:text-sm font-medium text-primary relative inline-block">
        Dashboard
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
      </h2>
    </div>
  );
};
