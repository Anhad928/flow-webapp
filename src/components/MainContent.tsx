// src/MainContent.tsx
import React, { useState } from "react";
import RepositoryForm from "./RepositoryForm";
import FlowChart from "./FlowChart";
import ChatPanel from "./ChatPanel";
import { fetchRepoTree, FileNode } from "../services/github";

const MainContent: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlow, setGeneratedFlow] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateFlow = async (url: string) => {
    setIsGenerating(true);
    setErrorMsg(null);
    setRepoUrl(url);

    try {
      const tree = await fetchRepoTree(url);
      setFileTree(tree);
      setGeneratedFlow(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error occurred.");
      }
      setErrorMsg("Failed to fetch repository. Is it public and spelled correctly?");
    }

    setIsGenerating(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Form Panel */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
          <div className="relative bg-gothicGray dark:bg-gothicDark rounded-lg shadow-xl p-6 transition-all duration-300">
            <h1 className="text-3xl font-bold gradient-text mb-6">
              Generate Repository Flow
            </h1>
            <RepositoryForm
              onGenerate={handleGenerateFlow}
              isGenerating={isGenerating}
            />
            {errorMsg && (
              <p className="mt-4 text-red-500">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="bg-gothicGray dark:bg-gothicDark rounded-lg shadow-xl p-6 transition-all duration-300">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-red-700 border-t-red-500 rounded-full animate-spin"></div>
              </div>
              <p className="mt-6 text-lg text-gray-300 animate-pulse">
                Analyzing repository structure...
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {generatedFlow && !isGenerating && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-out]">
            {/* FlowChart */}
            <div className="lg:col-span-2 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative bg-gothicGray dark:bg-gothicDark rounded-lg shadow-xl p-6 transition-all duration-300">
                <h2 className="text-2xl font-bold gradient-text mb-4">
                  Repository Flow
                </h2>
                <FlowChart repoUrl={repoUrl} nodes={fileTree} />
              </div>
            </div>

            {/* ChatPanel */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative bg-gothicGray dark:bg-gothicDark rounded-lg shadow-xl p-6 transition-all duration-300">
                <ChatPanel repoUrl={repoUrl} fileTree={fileTree} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;
