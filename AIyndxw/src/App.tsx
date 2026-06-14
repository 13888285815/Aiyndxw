import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import Sidebar from './components/Sidebar';
import TaskPanel from './components/TaskPanel';
import FileManager from './components/FileManager';
import ScheduledTasks from './components/ScheduledTasks';
import SystemUpdate from './components/SystemUpdate';
import AgentPanel from './components/AgentPanel';
import SkillCenter from './components/SkillCenter';
import SystemSettings from './components/SystemSettings';
import MemoryPanel from './components/MemoryPanel';
import { sendMessage } from './services/api';

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

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ThinkingStep {
  step: string;
  content: string;
  completed?: boolean;
}

export interface ToolCall {
  name: string;
  description: string;
  params: Record<string, string>;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  description: string;
}

export interface Model {
  id: string;
  name: string;
  type: 'local' | 'cloud';
  status: 'active' | 'inactive';
}

const COMMANDS: Record<string, { description: string; execute: (args: string[]) => { response: string; steps: ThinkingStep[]; toolCall?: ToolCall } }> = {
  '/help': {
    description: '显示帮助信息',
    execute: () => ({
      response: `📋 可用指令：\n\n/time - 显示当前时间\n/clear - 清空对话\n/status - 查看系统状态\n/config theme [dark/light] - 切换主题\n/open [app] - 打开应用\n/search [query] - 搜索内容\n/model list - 列出可用模型\n/agent list - 列出智能体\n/skill list - 列出技能\n/version - 显示版本信息`,
      steps: [{ step: '1', content: '解析指令：/help', completed: true }, { step: '2', content: '检索可用指令列表', completed: true }, { step: '3', content: '格式化帮助信息', completed: true }],
    }),
  },
  '/time': {
    description: '显示当前时间',
    execute: () => ({
      response: `⏰ 当前时间：${new Date().toLocaleString('zh-CN')}`,
      steps: [{ step: '1', content: '获取系统时间', completed: true }, { step: '2', content: '格式化时间显示', completed: true }],
    }),
  },
  '/clear': {
    description: '清空对话',
    execute: () => ({
      response: '对话已清空',
      steps: [{ step: '1', content: '清除消息列表', completed: true }, { step: '2', content: '重置对话状态', completed: true }],
    }),
  },
  '/status': {
    description: '查看系统状态',
    execute: () => ({
      response: `📊 系统状态：\n\n- 连接状态：✅ 在线\n- 当前模型：Hermes-4 Pro\n- 智能体数量：5\n- 技能数量：8\n- 任务数量：15\n- 配额：98%`,
      steps: [{ step: '1', content: '检查连接状态', completed: true }, { step: '2', content: '获取模型信息', completed: true }, { step: '3', content: '统计系统资源', completed: true }],
    }),
  },
  '/version': {
    description: '显示版本信息',
    execute: () => ({
      response: `📦 意念AI v1.0.0\n\n- 构建日期：${new Date().toLocaleDateString('zh-CN')}\n- 框架：React + TypeScript\n- 样式：Tailwind CSS 3\n- 构建工具：Vite`,
      steps: [{ step: '1', content: '获取版本信息', completed: true }, { step: '2', content: '显示系统配置', completed: true }],
    }),
  },
  '/agent': {
    description: '智能体管理',
    execute: (args) => {
      if (args[0] === 'list') {
        return {
          response: `🤖 可用智能体：\n\n1. **JARVIS** - 基础设施守护者\n   状态：🟢 在线\n   职责：系统健康监控、Docker服务管理、工作空间版本控制\n\n2. **HERMES** - 邮件管道\n   状态：🟢 在线\n   职责：IMAP邮箱读取、智能邮件分类、每日简报生成\n\n3. **CHRONOS** - 时间架构师\n   状态：🟢 在线\n   职责：日程读取与更新、晨间简报生成、会议冲突检测\n\n4. **LEDGER** - 财务管家\n   状态：🟡 忙碌\n   职责：发票处理、支出跟踪、财务报告生成\n\n5. **CYRANO** - 文案助手\n   状态：🟢 在线\n   职责：邮件撰写、文档生成、内容优化\n\n6. **MYTHOS** - 深度推理专家\n   状态：🟢 在线\n   职责：循环推理、深度思考、沉默推理`,
          steps: [{ step: '1', content: '查询智能体列表', completed: true }, { step: '2', content: '获取各智能体状态', completed: true }, { step: '3', content: '格式化显示智能体信息', completed: true }],
        };
      }
      return {
        response: `❓ 未知子命令。\n\n可用子命令：\n- /agent list - 列出所有智能体`,
        steps: [{ step: '1', content: '解析指令', completed: true }, { step: '2', content: '检测无效子命令', completed: true }],
      };
    },
  },
  '/model': {
    description: '模型管理',
    execute: (args) => {
      if (args[0] === 'list') {
        return {
          response: `🧠 可用模型：\n\n1. **Hermes-4 Pro** (Nous Research)\n   能力：代码生成、复杂推理、多模态\n   成本：高\n   状态：✅ 可用\n\n2. **GPT-4o** (OpenAI)\n   能力：通用任务、代码、图像理解\n   成本：高\n   状态：✅ 可用\n\n3. **Claude 3.5 Sonnet** (Anthropic)\n   能力：长上下文、分析任务、代码\n   成本：中\n   状态：✅ 可用\n\n4. **Llama 3.3 70B** (Meta)\n   能力：本地运行、隐私保护、通用任务\n   成本：低\n   状态：✅ 可用\n\n5. **Mistral Large 2** (Mistral)\n   能力：快速响应、代码、推理\n   成本：中\n   状态：✅ 可用\n\n6. **OpenMythos** (Open Source)\n   能力：循环推理、深度思考、沉默推理\n   成本：中\n   状态：✅ 可用`,
          steps: [{ step: '1', content: '查询模型列表', completed: true }, { step: '2', content: '获取模型详细信息', completed: true }, { step: '3', content: '格式化显示模型信息', completed: true }],
        };
      }
      return {
        response: `❓ 未知子命令。\n\n可用子命令：\n- /model list - 列出所有可用模型`,
        steps: [{ step: '1', content: '解析指令', completed: true }, { step: '2', content: '检测无效子命令', completed: true }],
      };
    },
  },
  '/skill': {
    description: '技能管理',
    execute: (args) => {
      if (args[0] === 'list') {
        return {
          response: `⚡ 已安装技能：\n\n1. **代码生成** - 根据需求描述自动生成代码\n   使用次数：45次\n\n2. **文档摘要** - 自动提取文档关键信息\n   使用次数：32次\n\n3. **数据分析** - 分析数据并生成可视化报告\n   使用次数：28次\n\n4. **翻译助手** - 支持多种语言的翻译功能\n   使用次数：56次\n\n5. **PDF处理** - PDF文档编辑和转换\n   使用次数：15次\n\n📦 可安装技能：图像生成、语音转文字、表格处理\n\n💡 自动技能：每日邮件分类规则、会议纪要生成、周报自动生成`,
          steps: [{ step: '1', content: '查询已安装技能', completed: true }, { step: '2', content: '获取可安装技能', completed: true }, { step: '3', content: '获取自动学习技能', completed: true }],
        };
      }
      return {
        response: `❓ 未知子命令。\n\n可用子命令：\n- /skill list - 列出所有技能`,
        steps: [{ step: '1', content: '解析指令', completed: true }, { step: '2', content: '检测无效子命令', completed: true }],
      };
    },
  },
};

function App() {
  const [activeSection, setActiveSection] = useState('task-all-tasks');
  const [selectedTab, setSelectedTab] = useState<'assistant' | 'tasks' | 'files'>('assistant');
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'voice' | 'image' | 'file'>('text');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'local' | 'cloud' | 'auto'>('auto');
  const [currentModel, setCurrentModel] = useState('Hermes-4 Pro');
  
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    setLogs(prev => [...prev.slice(-49), { timestamp: new Date().toLocaleTimeString(), message, type }]);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    addLog('意念AI启动成功', 'success');
    addLog('已连接到本地模型', 'info');
  }, [addLog]);

  const executeCommand = (command: string): { response: string; steps: ThinkingStep[]; toolCall?: ToolCall } | null => {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (COMMANDS[cmd]) {
      return COMMANDS[cmd].execute(args);
    }
    
    const shortCmd = cmd.split('/')[1];
    const baseCommands = ['agent', 'model', 'skill'];
    if (baseCommands.includes(shortCmd)) {
      return COMMANDS['/' + shortCmd].execute(args);
    }
    
    return null;
  };

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content) return;

    setInputValue('');
    setSelectedFiles([]);

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
      type: messageType,
    };
    setMessages(prev => [...prev, userMessage]);
    addLog(`用户消息: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`, 'info');

    const commandResult = executeCommand(content);
    
    if (commandResult) {
      setIsThinking(true);
      setThinkingSteps(commandResult.steps);

      for (let i = 0; i < commandResult.steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setThinkingSteps(prev => prev.map((step, idx) => idx <= i ? { ...step, completed: true } : step));
      }

      if (commandResult.toolCall) {
        addLog(`调用工具: ${commandResult.toolCall.name}`, 'info');
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: commandResult.response,
        sender: 'assistant',
        timestamp: new Date(),
        thinking: commandResult.steps,
      };

      setMessages(prev => [...prev, assistantMessage]);
      addLog('助手响应完成', 'success');
      setIsThinking(false);
      setThinkingSteps([]);

      if (content === '/clear') {
        setTimeout(() => {
          setMessages([]);
          addLog('对话已清空', 'info');
        }, 500);
      }
    } else {
      const thinkingContent = [
        { step: '1', content: '理解用户意图' },
        { step: '2', content: '分析问题需求' },
        { step: '3', content: '生成响应方案' },
        { step: '4', content: '优化回答质量' },
      ];

      setIsThinking(true);
      setThinkingSteps(thinkingContent);

      for (let i = 0; i < thinkingContent.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setThinkingSteps(prev => prev.map((step, idx) => idx <= i ? { ...step, completed: true } : step));
      }

      const apiResponse = await sendMessage(content);
      
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: apiResponse.content,
        sender: 'assistant',
        timestamp: new Date(),
        thinking: apiResponse.thinking.length > 0 
          ? apiResponse.thinking.map(s => ({ ...s, completed: true }))
          : thinkingContent.map(s => ({ ...s, completed: true })),
      };

      setMessages(prev => [...prev, assistantMessage]);
      addLog('AI响应生成完成', 'success');
      setIsThinking(false);
      setThinkingSteps([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    addLog('开始录音', 'info');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    addLog('录音停止', 'info');
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      content: '🎤 语音消息已录制',
      sender: 'user',
      timestamp: new Date(),
      type: 'voice',
    }]);
  };

  const renderContent = () => {
    if (selectedTab === 'tasks') {
      return <TaskPanel filter={filter} />;
    }
    if (selectedTab === 'files') {
      return <FileManager />;
    }
    if (activeSection === 'task-all-tasks') {
      return <TaskPanel filter="all" />;
    }
    if (activeSection === 'task-in-progress') {
      return <TaskPanel filter="in_progress" />;
    }
    if (activeSection === 'task-completed') {
      return <TaskPanel filter="completed" />;
    }
    if (activeSection.startsWith('agent-')) {
      return <AgentPanel agentId={activeSection.split('-')[1]} />;
    }
    if (activeSection === 'skill-store' || activeSection === 'my-skills') {
      return <SkillCenter activeTab={activeSection} />;
    }
    if (activeSection === 'memory') {
      return <MemoryPanel />;
    }
    if (activeSection === 'setting-scheduled') {
      return <ScheduledTasks />;
    }
    if (activeSection === 'setting-update') {
      return <SystemUpdate />;
    }
    if (activeSection === 'setting-connection' || activeSection === 'setting-model') {
      return <SystemSettings activeTab={activeSection} />;
    }
    if (activeSection === 'create-task') {
      return (
        <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-800/50 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm text-gray-300">新建任务</span>
            </div>
            <button
              onClick={() => setActiveSection('task-all-tasks')}
              className="text-xs px-3 py-1 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-colors"
            >
              查看任务列表
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
              <div className="min-w-full max-w-3xl mx-auto space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-700 text-gray-300 flex-shrink-0">AI</div>
                  <div className="max-w-[70%]">
                    <div className="inline-block px-4 py-2 rounded-2xl bg-gray-800 text-gray-100 rounded-bl-md">
                      <div className="whitespace-pre-wrap text-sm">
                        您好！我来帮您创建新任务。请告诉我：

**1️⃣ 任务标题是什么？**（将作为任务的文件名）

**2️⃣ 任务描述（可选）**

**3️⃣ 优先级**（高/中/低，默认中等）

您可以直接输入，我会帮您创建任务。
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">🎯 任务创建示例</h4>
                  <div className="space-y-2 text-xs text-gray-400">
                    <p><span className="text-blue-400">快速创建：</span>完成项目报告</p>
                    <p><span className="text-blue-400">带优先级：</span>完成项目报告 @高</p>
                    <p><span className="text-blue-400">完整格式：</span>完成项目报告 | 本周五前完成 | 高</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-blue-600 text-white flex-shrink-0">AI</div>
                  <div className="max-w-[70%]">
                    <div className="inline-block px-4 py-2 rounded-2xl bg-gray-800 text-gray-100 rounded-bl-md">
                      <div className="whitespace-pre-wrap text-sm">
                        <span className="text-yellow-400">💭 思考过程：</span>
                        
1. 解析用户输入的任务信息
2. 提取任务标题（第一部分）
3. 识别任务描述（| 分隔符后）
4. 判断优先级（@标记或默认中等）
5. 创建任务对象并保存
6. 返回任务创建成功信息
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-72 bg-gray-800/30 border-l border-gray-700 p-4 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-300 mb-3">📝 快速任务模板</h4>
              <div className="space-y-2">
                {['完成周报', '代码审查', '会议准备', '文档更新', '代码重构', 'Bug修复'].map((task, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMessages(prev => [...prev, {
                        id: `msg-${Date.now()}`,
                        content: `✅ 任务创建成功！\n\n**任务标题**: ${task}\n**描述**: 暂无描述\n**优先级**: 中\n**状态**: 待处理`,
                        sender: 'assistant',
                        timestamp: new Date(),
                      }]);
                    }}
                    className="w-full text-left px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    {task}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 p-4 bg-gray-800/50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="输入任务信息（如：完成项目报告 | 本周五前完成 | 高）"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = (e.target as HTMLInputElement).value.trim();
                    if (input) {
                      const parts = input.split('|').map(p => p.trim());
                      const title = parts[0];
                      const description = parts[1] || '';
                      const priorityPart = parts[2] || parts[0].match(/@(高|中|低)/);
                      const priority = priorityPart 
                        ? (priorityPart === '高' ? 'high' : priorityPart === '低' ? 'low' : 'medium')
                        : 'medium';
                      
                      setMessages(prev => [...prev, {
                        id: `msg-${Date.now()}`,
                        content: `✅ 任务创建成功！\n\n**任务标题**: ${title.replace(/@(高|中|低)/g, '').trim()}\n**描述**: ${description || '暂无描述'}\n**优先级**: ${priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}\n**状态**: 待处理`,
                        sender: 'assistant',
                        timestamp: new Date(),
                      }]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  setActiveSection('task-all-tasks');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                创建任务
              </button>
            </div>
          </div>
        </div>
      );
    }
    return renderAssistantPanel();
  };

  const renderAssistantPanel = () => {
    return (
      <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">智能助手</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConnectionMode('local')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${connectionMode === 'local' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              本地
            </button>
            <button
              onClick={() => setConnectionMode('cloud')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${connectionMode === 'cloud' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              云端
            </button>
            <button
              onClick={() => setConnectionMode('auto')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${connectionMode === 'auto' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              自动
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-x-auto overflow-y-auto p-4 scrollbar-thin">
            <div className="min-w-full max-w-3xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold">意</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">欢迎使用意念AI</h2>
                  <p className="text-gray-400 text-sm text-center max-w-md">
                    我可以帮助您完成各种任务。输入消息开始对话，或使用 /help 查看可用指令。
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} animate-fadeIn`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      {msg.sender === 'user' ? '您' : 'AI'}
                    </div>
                    <div className={`max-w-[70%] ${msg.sender === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-800 text-gray-100 rounded-bl-md'}`}>
                        <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isThinking && (
                <div className="flex gap-3 animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-300 flex-shrink-0">AI</div>
                  <div className="max-w-[70%]">
                    <div className="inline-block px-4 py-2 rounded-2xl bg-gray-800 rounded-bl-md">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-400">思考中...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="w-72 bg-gray-800/30 border-l border-gray-700 p-4 overflow-y-auto scrollbar-thin">
            {isThinking ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 mb-3">💭 思考过程</h4>
                {thinkingSteps.map((step, idx) => (
                  <div key={idx} className={`flex items-start gap-2 p-2 rounded-lg ${step.completed ? 'bg-green-500/10 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${step.completed ? 'bg-green-500' : 'bg-gray-600'}`}>
                      {step.completed ? '✓' : idx + 1}
                    </span>
                    <div>
                      <div className="text-xs text-gray-500">步骤 {step.step}</div>
                      <div className="text-sm">{step.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length > 0 && messages[messages.length - 1].thinking ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 mb-3">💭 思考过程</h4>
                {messages[messages.length - 1].thinking?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-green-500/10 text-green-400">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-green-500 flex-shrink-0">✓</span>
                    <div>
                      <div className="text-xs text-gray-500">步骤 {step.step}</div>
                      <div className="text-sm">{step.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 mb-3">📊 系统状态</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">连接状态</span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-green-400">在线</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">当前模型</span>
                    <span className="text-gray-300">{currentModel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">连接模式</span>
                    <span className="text-gray-300">{connectionMode === 'local' ? '本地' : connectionMode === 'cloud' ? '云端' : '自动'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">消息数</span>
                    <span className="text-gray-300">{messages.length}</span>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-300 mt-4 mb-3">⚡ 快捷指令</h4>
                <div className="space-y-1">
                  {Object.keys(COMMANDS).map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => setInputValue(cmd)}
                      className="w-full text-left px-2 py-1.5 text-xs bg-gray-700/50 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      <span className="text-blue-400">{cmd}</span>
                      <span className="ml-2 text-gray-500">{COMMANDS[cmd].description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 p-4 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessageType('text')}
                className={`p-2 rounded-lg transition-colors ${messageType === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                title="文本消息"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setMessageType('voice')}
                className={`p-2 rounded-lg transition-colors ${messageType === 'voice' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                title="语音消息"
              >
                {isRecording ? (
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM6 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM18 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setMessageType('image')}
                className={`p-2 rounded-lg transition-colors ${messageType === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                title="图片消息"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setMessageType('file')}
                className={`p-2 rounded-lg transition-colors ${messageType === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                title="文件消息"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            
            {messageType === 'image' && (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
            )}
            {messageType === 'file' && (
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
            )}

            <div className="flex-1" />

            <button
              onClick={() => setShowHelp(true)}
              className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-colors"
              title="帮助"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 mt-3">
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 6v12M6 12h12" />
                </svg>
                停止录制
              </button>
            ) : (
              <>
                {messageType === 'image' ? (
                  <button
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    选择图片
                  </button>
                ) : messageType === 'file' ? (
                  <button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    选择文件
                  </button>
                ) : (
                  <>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="输入消息或指令..."
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      发送
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm text-gray-300 truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-14 bg-gray-900 border-t border-gray-800 overflow-hidden">
          <div className="h-full flex items-center px-4 gap-2 overflow-x-auto scrollbar-thin">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg flex-shrink-0">
              <span className="text-xs text-gray-400">快捷指令:</span>
            </div>
            {['/status', '/agent list', '/model list', '/skill list'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => setInputValue(cmd)}
                className="px-3 py-2 bg-gray-800/50 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                {cmd}
              </button>
            ))}
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                在线
              </span>
              <span>模型: {currentModel}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-lg font-bold">意</span>
                </div>
                <span className="text-lg font-semibold">意念AI</span>
              </div>
              
              {activeSection === 'task-all-tasks' || 
               activeSection === 'task-in-progress' || 
               activeSection === 'task-completed' ? (
                <div className="flex items-center gap-1 bg-gray-700/50 rounded-lg p-1">
                  <button
                    onClick={() => { setFilter('all'); setActiveSection('task-all-tasks'); }}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => { setFilter('in_progress'); setActiveSection('task-in-progress'); }}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${filter === 'in_progress' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    进行中
                  </button>
                  <button
                    onClick={() => { setFilter('completed'); setActiveSection('task-completed'); }}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${filter === 'completed' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    已完成
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>在线</span>
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                <span>{currentModel}</span>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHelp(false)}>
          <div className="bg-gray-800 rounded-xl w-[600px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h2 className="font-semibold text-white">帮助中心</h2>
              <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
              <h3 className="text-sm font-medium text-gray-300 mb-3">📋 可用指令</h3>
              <div className="space-y-2">
                {Object.entries(COMMANDS).map(([cmd, info]) => (
                  <div key={cmd} className="flex items-center justify-between px-3 py-2 bg-gray-700/50 rounded-lg">
                    <span className="text-blue-400 font-mono text-sm">{cmd}</span>
                    <span className="text-gray-400 text-sm">{info.description}</span>
                  </div>
                ))}
              </div>
              
              <h3 className="text-sm font-medium text-gray-300 mt-4 mb-3">💬 消息类型</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p><span className="text-blue-400">文本消息</span> - 普通文字消息</p>
                <p><span className="text-green-400">语音消息</span> - 录制语音发送</p>
                <p><span className="text-purple-400">图片消息</span> - 发送图片</p>
                <p><span className="text-orange-400">文件消息</span> - 发送文件</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-gray-800 rounded-xl w-[600px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h2 className="font-semibold text-white">系统设置</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">连接模式</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConnectionMode('local')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${connectionMode === 'local' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    >
                      本地
                    </button>
                    <button
                      onClick={() => setConnectionMode('cloud')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${connectionMode === 'cloud' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    >
                      云端
                    </button>
                    <button
                      onClick={() => setConnectionMode('auto')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${connectionMode === 'auto' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    >
                      自动
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">当前模型</label>
                  <select
                    value={currentModel}
                    onChange={(e) => setCurrentModel(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Hermes-4 Pro">Hermes-4 Pro</option>
                    <option value="GPT-4o">GPT-4o</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="Llama 3.3 70B">Llama 3.3 70B</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
