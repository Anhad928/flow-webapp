import React from 'react';
import { Github, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg sticky top-0 z-10 transition-all duration-300">
      <div className="max-w-7.5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center group">
            <div className="relative">
              <Github className="h-7 w-7 text-indigo-600 dark:text-indigo-400 transform group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-1 bg-indigo-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="ml-3 text-2xl font-bold gradient-text">
              FlowGen
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:scale-110 hover:shadow-lg transform transition-all duration-300 relative overflow-hidden"
            aria-label="Toggle theme"
          >
            <div className="relative z-10">
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;