import React, { useState } from 'react';

interface RepositoryFormProps {
  onGenerate: (url: string) => void;
  isGenerating: boolean;
}

const RepositoryForm: React.FC<RepositoryFormProps> = ({ 
  onGenerate, 
  isGenerating 
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url: string): boolean => {
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubUrlPattern.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }
    
    if (!validateUrl(repoUrl)) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }
    
    setError('');
    onGenerate(repoUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label 
          htmlFor="repo-url" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          GitHub Repository URL
        </label>
        <div className="mt-1 relative">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-300"></div>
            <input
              type="text"
              id="repo-url"
              className={`relative block w-full pr-10 py-3 px-4 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300
                ${error ? 
                  'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 
                  'border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse" id="url-error">
            {error}
          </p>
        )}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter the full URL of a public GitHub repository to analyze its structure.
        </p>
      </div>
      
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isGenerating}
          className="relative inline-flex items-center px-6 py-3 rounded-lg text-base font-medium text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
        >
          <div className="absolute inset-0 gradient-bg"></div>
          <span className="relative flex items-center">
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="relative">Generating...</span>
              </>
            ) : (
              <span className="relative">Generate Flow</span>
            )}
          </span>
        </button>
      </div>
    </form>
  );
};

export default RepositoryForm;