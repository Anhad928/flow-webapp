// src/services/github.ts
import { Octokit } from "@octokit/rest";

/**
 * A FileNode now carries everything we need for a detailed, grouped
 * Mermaid flowchart:
 *  - id:      a sanitized identifier (used in the DSL)
 *  - label:   what actually shows in the box
 *  - group:   which subgraph it belongs to
 *  - path:    the original GitHub path
 *  - type:    "blob" (file) or "tree" (folder)
 */
export interface FileNode {
  id: string;
  label: string;
  group: string;
  path: string;
  type: "blob" | "tree";
}

const octokit = new Octokit();

export async function fetchRepoTree(repoUrl: string): Promise<FileNode[]> {
  // parse owner/repo from the URL
  const { pathname } = new URL(repoUrl);
  const [, owner, repo] = pathname.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`);
  }

  // 1) determine default branch
  const { data: repoData } = await octokit.repos.get({ owner, repo });
  const branch = repoData.default_branch;

  // 2) fetch the recursive tree
  const { data: treeData } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "true",
  });

  if (!treeData.tree) {
    throw new Error("GitHub returned no tree data");
  }

  // 3) filter and map into our richer FileNode shape
  return treeData.tree
    .filter(
      (item): item is { path: string; type: "blob" | "tree" } =>
        (item.type === "blob" || item.type === "tree") &&
        typeof item.path === "string"
    )
    .map(item => {
      const path = item.path;
      const parts = path.split("/");
      // group by top-level directory (or "root" if no slash)
      const group = parts.length > 1 ? parts[0] : "root";
      // id must be a valid mermaid identifier
      const id = path.replace(/[^A-Za-z0-9]/g, "_");
      // use the final segment of the path as the box label
      const label = parts[parts.length - 1];
      return { id, label, group, path, type: item.type };
    });
}
