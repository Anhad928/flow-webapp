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
  const [activeTab, setActiveTab] = useState<"flow" | "chat">("flow");
  // Chat panel only appears after clicking "Open Chat"
  const [chatOpen, setChatOpen] = useState(false);

  const handleGenerateFlow = async (url: string) => {
    setRepoUrl(url);
    setErrorMsg("");
    setIsGenerating(true);
    setGeneratedFlow(false);

    try {
      const tree = await fetchRepoTree(url);
      setFileTree(tree);
      setGeneratedFlow(true);
      setActiveTab("flow");   // switch to flow tab automatically
    } catch (err: any) {
      console.error("fetchRepoTree error:", err);
      setErrorMsg(err.message || "Failed to fetch repository.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1) The generate-flow form */}
      <div className="relative group mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
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

      {/* 2) Only show tabs & content once flow is generated */}
      {generatedFlow && (
        <>
          {/* Tab buttons */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab("flow")}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === "flow"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Flowchart
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === "chat"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Chat
            </button>
          </div>

          <div className="bg-gothicGray dark:bg-gothicDark rounded-b-lg shadow-xl p-6 transition-all duration-300">
            {/* Flowchart Tab */}
            {activeTab === "flow" && (
              <FlowChart nodes={fileTree} repoUrl={repoUrl} />
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div>
                {!chatOpen ? (
                  <button
                    onClick={() => setChatOpen(true)}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Open Chat
                  </button>
                ) : (
                  <ChatPanel repoUrl={repoUrl} fileTree={fileTree} />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
};

export default MainContent;
