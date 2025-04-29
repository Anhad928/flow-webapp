/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import { openai } from "../openai";
import type { FileNode } from "../types";

export const analyze = Router();

analyze.post("/", async (req, res) => {
  const { repo, tree, question } = req.body as {
    repo: string;
    tree: FileNode[];
    question: string;
  };

  /* ─ SSE headers ─ */
  res.writeHead(200, {
    "Content-Type":  "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection:      "keep-alive"
  });

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: "You are FlowGen-AI, a concise repo analyst." },
        { role: "user",
          content:
            `Repository URL: ${repo}\n` +
            `File tree (JSON):\n${JSON.stringify(tree).slice(0, 8000)}`
        },
        { role: "assistant", content: "Ready." },
        { role: "user", content: question ?? "Give an overview." }
      ]
    });

    for await (const chunk of stream) {
      res.write(`data: ${chunk.choices[0].delta.content ?? ""}\n\n`);
    }
    res.write("data: [DONE]\n\n");
  } catch (err: any) {
    res.write(`data: [ERROR] ${err.message}\n\n`);
  } finally {
    res.end();
  }
});
