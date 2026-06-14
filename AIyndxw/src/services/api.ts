const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  thinking?: ThinkingStep[];
  type?: 'text' | 'image' | 'file' | 'voice';
  fileName?: string;
  imageUrl?: string;
}

export interface ThinkingStep {
  step: string;
  content: string;
  completed?: boolean;
}

export interface ChatResponse {
  content: string;
  thinking?: ThinkingStep[];
}

const RESPONSES: Record<string, string[]> = {
  greeting: [
    '您好！我是意念AI，很高兴为您服务。有什么我可以帮助您的吗？',
    '你好！我是您的智能助手，随时准备为您提供帮助。',
    '嗨！我可以帮您处理各种任务，请问有什么需要吗？',
  ],
  thanks: [
    '不客气！很高兴能帮到您。',
    '不用谢，这是我应该做的！',
    '随时为您服务！',
  ],
  question: [
    '这是一个很好的问题！让我为您分析一下...',
    '我来帮您解答这个问题。',
    '让我仔细思考一下这个问题。',
  ],
  default: [
    '我理解您的需求，让我来帮您处理。',
    '收到，我来分析一下您的请求。',
    '好的，我来为您提供帮助。',
    '我正在思考如何最好地回答您的问题...',
    '这是一个有趣的话题，让我来详细说明。',
  ],
};

function getResponseType(message: string): keyof typeof RESPONSES {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('你好') || lowerMsg.includes('您好') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
    return 'greeting';
  }
  if (lowerMsg.includes('谢谢') || lowerMsg.includes('感谢') || lowerMsg.includes('thank')) {
    return 'thanks';
  }
  if (lowerMsg.includes('吗') || lowerMsg.includes('？') || lowerMsg.includes('?') || lowerMsg.includes('什么') || lowerMsg.includes('如何')) {
    return 'question';
  }
  return 'default';
}

function getRandomResponse(type: keyof typeof RESPONSES): string {
  const responses = RESPONSES[type];
  return responses[Math.floor(Math.random() * responses.length)];
}

async function getMockResponse(message: string): Promise<ChatResponse> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const responseType = getResponseType(message);
  const baseResponse = getRandomResponse(responseType);

  const thinkingContent: ThinkingStep[] = [
    { step: '1', content: '理解用户意图', completed: true },
    { step: '2', content: '分析问题需求', completed: true },
    { step: '3', content: '生成响应方案', completed: true },
    { step: '4', content: '优化回答质量', completed: true },
  ];

  return {
    content: `${baseResponse}\n\n您输入的内容是："${message}"\n\n💡 提示：如果您需要使用特定功能，请尝试使用指令，如 /help 查看可用指令。`,
    thinking: thinkingContent,
  };
}

export async function sendMessage(message: string): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.warn('API response not ok:', errorData?.error || `HTTP ${response.status}`);
      throw new Error(errorData?.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content || '抱歉，我无法理解您的请求。',
      thinking: data.thinking || [],
    };
  } catch (error) {
    console.error('API call failed, using mock response:', error);
    return getMockResponse(message);
  }
}

export async function getModels(): Promise<{ id: string; name: string; status: string }[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.log('Failed to fetch models, using mock data');
    return [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', status: 'active' },
      { id: 'hermes3', name: 'Hermes-4 Pro', status: 'active' },
      { id: 'gpt-4o', name: 'GPT-4o', status: 'active' },
      { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', status: 'active' },
      { id: 'llama-3', name: 'Llama 3.3 70B', status: 'active' },
    ];
  }
}

export async function getSystemStatus(): Promise<{ status: string; model: string; connection: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.log('Failed to get system status, using mock data');
    return { status: 'online', model: 'DeepSeek Chat', connection: 'cloud' };
  }
}
