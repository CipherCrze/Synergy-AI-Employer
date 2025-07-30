import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode.tsx';

interface DarkModeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`flex items-center space-x-2 p-2 rounded-xl transition-all duration-200 hover:bg-deloitte-gray-100 dark:hover:bg-deloitte-dark-surface-hover ${className}`}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative">
        <div className={`
          dark-mode-toggle 
          ${isDarkMode ? 'dark-mode-toggle-dark' : 'dark-mode-toggle-light'}
        `}>
          <div className={`
            dark-mode-toggle-thumb 
            ${isDarkMode ? 'dark-mode-toggle-thumb-dark' : 'dark-mode-toggle-thumb-light'}
          `} />
        </div>
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium text-deloitte-dark dark:text-deloitte-dark-text-secondary">
          {isDarkMode ? 'Dark' : 'Light'}
        </span>
      )}
      
      <div className="flex items-center justify-center w-5 h-5">
        {isDarkMode ? (
          <Moon className="w-4 h-4 text-deloitte-primary" />
        ) : (
          <Sun className="w-4 h-4 text-deloitte-gray-600" />
        )}
      </div>
    </button>
  );
};

export default DarkModeToggle;