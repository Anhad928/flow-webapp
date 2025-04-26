import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import { OpenAI } from 'openai';

const app  = express();
const open = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.post('/api/analyze', async (req, res) => {
  const { repo, tree } = req.body as { repo: string; tree: { path: string }[] };

  const prompt = `
You are FlowGen-AI. Repository: ${repo}
Files:
${tree.map(n => '• ' + n.path).join('\n')}
Return a concise markdown overview.`;

  const stream = await open.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [{ role: 'user', content: prompt }]
  });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',  'keep-alive');

  for await (const chunk of stream) {
    res.write(`data: ${chunk.choices[0].delta.content ?? ''}\n\n`);
  }
  res.end();
});

app.listen(process.env.PORT ?? 4000, () =>
  console.log('✨ AI back-end listening on :' + (process.env.PORT ?? 4000))
);
