import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 5001;

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = 'sk-70389affe8c44e91821f5e80033e7ede';
const DEEPSEEK_MODEL = 'deepseek-chat';

app.use(cors());
app.use(express.json());

app.post('/api/v1/chat/completions', async (req, res) => {
  try {
    const { message } = req.body;
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        stream: false,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json({
      content: data.choices?.[0]?.message?.content || '抱歉，我无法理解您的请求。',
      thinking: [
        { step: '1', content: '理解用户意图', completed: true },
        { step: '2', content: '分析问题需求', completed: true },
        { step: '3', content: '生成响应方案', completed: true },
        { step: '4', content: '优化回答质量', completed: true },
      ],
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      content: `请求失败：${error.message}`,
      thinking: [],
    });
  }
});

app.get('/api/v1/models', (req, res) => {
  res.json([
    { id: 'deepseek-chat', name: 'DeepSeek Chat', status: 'active' },
    { id: 'hermes3', name: 'Hermes-4 Pro', status: 'active' },
    { id: 'gpt-4o', name: 'GPT-4o', status: 'active' },
    { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', status: 'active' },
  ]);
});

app.get('/api/v1/status', (req, res) => {
  res.json({ status: 'online', model: 'DeepSeek Chat', connection: 'cloud' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
