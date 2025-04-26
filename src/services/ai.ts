/* eslint-disable @typescript-eslint/no-explicit-any */
export async function* streamAnalysis(repo: string, tree: any[]) {
  const res = await fetch('http://localhost:4000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo, tree })
  });
  if (!res.body) throw new Error('No stream');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}
