import React, { useState } from 'react';
import RepositoryForm from './RepositoryForm';
import FlowChart from './FlowChart';
import ChatPanel from './ChatPanel';

const MainContent: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlow, setGeneratedFlow] = useState<boolean>(false);
  const [repoUrl, setRepoUrl] = useState('');

  const handleGenerateFlow = async (url: string) => {
    setIsGenerating(true);
    setRepoUrl(url);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGeneratedFlow(true);
    setIsGenerating(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-all duration-300">
            <h1 className="text-3xl font-bold gradient-text mb-6">
              Generate Repository Flow
            </h1>
            <RepositoryForm 
              onGenerate={handleGenerateFlow} 
              isGenerating={isGenerating} 
            />
          </div>
        </div>
        
        {isGenerating && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-all duration-300">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 blur-lg bg-indigo-500/30 rounded-full"></div>
              </div>
              <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 animate-pulse">
                Analyzing repository structure...
              </p>
            </div>
          </div>
        )}
        
        {generatedFlow && !isGenerating && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="lg:col-span-2 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-all duration-300">
                <h2 className="text-2xl font-bold gradient-text mb-4">
                  Repository Flow
                </h2>
                <FlowChart repoUrl={repoUrl} />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-all duration-300">
                <ChatPanel repoUrl={repoUrl} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;