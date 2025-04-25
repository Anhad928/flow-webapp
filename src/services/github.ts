// src/services/github.ts
import { Octokit } from "@octokit/rest";

export interface FileNode {
  path: string;
  type: "blob" | "tree";
}

const octokit = new Octokit();    // ← no baseUrl override

export async function fetchRepoTree(repoUrl: string): Promise<FileNode[]> {
  const { pathname } = new URL(repoUrl);
  const [, owner, repo] = pathname.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`);
  }

  // 1) Get default branch
  const { data: repoData } = await octokit.repos.get({ owner, repo });
  const branch = repoData.default_branch;

  // 2) Fetch the full tree
  const { data: treeData } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "true",
  });

  if (!treeData.tree) {
    throw new Error("GitHub returned no tree data");
  }

  // 3) Filter & map
  return treeData.tree
    .filter(
      (item): item is { path: string; type: "blob" | "tree" } =>
        (item.type === "blob" || item.type === "tree") &&
        typeof item.path === "string"
    )
    .map(item => ({
      path: item.path,
      type: item.type,
    }));
}
