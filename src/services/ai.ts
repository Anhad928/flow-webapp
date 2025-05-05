// src/services/api.ts
export async function* streamAnswer(
    repo: string,
    tree: { path: string; type: "blob" | "tree" }[],
    question: string
  ) {
    if (!process.env.VITE_BACKEND_URL) {
      throw new Error("Environment variable VITE_BACKEND_URL is not defined");
    }

    const res = await fetch(process.env.VITE_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo, tree, question }),
    });
  
    if (!res.ok || !res.body) {
      throw new Error(`API error – status ${res.status}`);
    }
  
    // Read the Server-Sent-Events stream token-by-token
    const reader = res.body
      .pipeThrough(new TextDecoderStream())
      .getReader();
  
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
  
      buffer += value;
      // Each SSE chunk ends with "\n\n"
      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const chunk = buffer.slice(0, idx).trim(); // trim trailing \n
        buffer = buffer.slice(idx + 2);
  
        if (chunk.startsWith("data:")) {
          const payload = chunk.slice(5).trim();
          if (payload === "[DONE]") return;
          yield payload; // ← emit the token
        }
      }
    }
  }
  