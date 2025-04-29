/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/MainContent.tsx
import React, { useState } from "react";
import RepositoryForm from "./RepositoryForm";
import FlowChart from "./FlowChart";
import ChatPanel from "./ChatPanel";
import { fetchRepoTree, FileNode } from "../services/github";

const MainContent: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlow, setGeneratedFlow] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Tab state: "flow" or "chat"


  const handleGenerateFlow = async (url: string) => {
    const startTime = Date.now(); // Track start time
    setRepoUrl(url);
    setErrorMsg("");
    setIsGenerating(true);
    setGeneratedFlow(false);

    try {
      const tree = await fetchRepoTree(url);
      setFileTree(tree);
      setGeneratedFlow(true);
// =/ switch to flow tab automatically
      ;
    } catch (err: any) {
      console.error("fetchRepoTree error:", err);
      setErrorMsg(err.message || "Failed to fetch repository.");
    }  finally {
      // Calculate remaining time to ensure 5-second minimum
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(5000 - elapsed, 0);
      
      setTimeout(() => {
        setIsGenerating(false);
      }, remainingDelay);
    }
  };

  return (
    <main className="max-w-7.5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1) The generate-flow form */}
      <div className="relative group mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-all duration-300">
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

      {/* 2) Only show tabs & content once flow is generated */}
      {/* 2) Only show tabs & content once flow is generated AND loading is complete */}
      {generatedFlow && !isGenerating && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="lg:col-span-2 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-all duration-300">
                <h2 className="text-2xl font-bold gradient-text mb-4">
                  Repository Flow
                </h2>
                <FlowChart nodes = {fileTree} repoUrl={repoUrl} />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col h-[800px] transition-all duration-300">
                <ChatPanel repoUrl={repoUrl} fileTree={fileTree} />
              </div>
            </div>
          </div>
        )}
    </main>
  );
};

export default MainContent;