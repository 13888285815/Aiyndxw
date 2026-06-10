import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TaskPanel from './components/TaskPanel';
import FileManager from './components/FileManager';
import ScheduledTasks from './components/ScheduledTasks';
import SystemUpdate from './components/SystemUpdate';
import AgentPanel from './components/AgentPanel';
import SkillCenter from './components/SkillCenter';
import SystemSettings from './components/SystemSettings';

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
  provider: string;
  type: 'local' | 'cloud';
  status: 'available' | 'loading' | 'unavailable';
  contextWindow: number;
  capabilities: string[];
}

const AGENTS: Agent[] = [
  { id: 'jarvis', name: 'JARVIS', role: '基础设施守护者', status: 'online', description: '监控系统健康、管理工作空间、自动化运维' },
  { id: 'hermes', name: 'HERMES', role: '邮件管道', status: 'online', description: '智能分类邮件、生成日报摘要、邮件自动回复' },
  { id: 'chronos', name: '时间架构师', status: 'online', role: '时间架构师', description: '管理日程、生成简报、协调提醒' },
  { id: 'ledger', name: 'LEDGER', role: '财务管家', status: 'busy', description: '处理发票、跟踪支出、生成财务报告' },
  { id: 'cyrano', name: 'CYRANO', role: '文案助手', status: 'online', description: '撰写邮件、生成文档、优化内容' },
  { id: 'mythos', name: 'MYTHOS', role: '深度推理专家', status: 'online', description: '基于OpenMythos架构，处理复杂推理任务' },
];

const MODELS: Model[] = [
  { id: 'hermes-4-pro', name: 'Hermes-4 Pro', provider: 'Nous Research', type: 'local', status: 'available', contextWindow: 128000, capabilities: ['代码生成', '复杂推理', '多模态'] },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', type: 'cloud', status: 'available', contextWindow: 128000, capabilities: ['通用任务', '代码', '图像理解'] },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', type: 'cloud', status: 'available', contextWindow: 200000, capabilities: ['长上下文', '分析任务', '代码'] },
  { id: 'llama-3-3-70b', name: 'Llama 3.3 70B', provider: 'Meta', type: 'local', status: 'available', contextWindow: 128000, capabilities: ['本地运行', '隐私保护', '通用任务'] },
  { id: 'mistral-large-2', name: 'Mistral Large 2', provider: 'Mistral', type: 'cloud', status: 'available', contextWindow: 128000, capabilities: ['快速响应', '代码', '推理'] },
];

const TOOLS = [
  { name: 'web_search', description: '网络搜索', icon: '🔍' },
  { name: 'file_read', description: '读取文件', icon: '📄' },
  { name: 'file_write', description: '写入文件', icon: '✏️' },
  { name: 'terminal', description: '执行命令', icon: '💻' },
  { name: 'schedule', description: '日程管理', icon: '📅' },
  { name: 'email', description: '邮件发送', icon: '📧' },
];

const COMMANDS: Record<string, {
  category: string;
  description: string;
  execute: (args: string[]) => { response: string; steps: ThinkingStep[]; toolCall?: ToolCall };
}> = {
  '/help': {
    category: '系统管理',
    description: '显示所有可用指令',
    execute: () => ({
      response: `## 📖 指令帮助

### 系统管理
- \`/help\` - 显示指令帮助
- \`/status\` - 查看系统状态
- \`/clear\` - 清空对话记录

### 智能体管理
- \`/agent list\` - 列出所有智能体
- \`/agent start <名称>\` - 启动智能体
- \`/agent stop <名称>\` - 停止智能体

### 模型管理
- \`/model list\` - 列出可用模型
- \`/model select <名称>\` - 选择模型
- \`/model auto\` - 启用智能模型路由

### 技能管理
- \`/skill list\` - 列出自动技能
- \`/skill train\` - 训练新技能

### 记忆管理
- \`/memory list\` - 查看记忆内容
- \`/memory clear [类型]\` - 清空记忆

### 应用操作
- \`/open <应用>\` - 打开应用程序
- \`/search <关键词>\` - 浏览器搜索
- \`/navigate <网址>\` - 导航到网址

### 配置
- \`/config theme <dark/light>\` - 设置主题`,
      steps: [{ step: '指令识别', content: '用户请求帮助信息' }, { step: '操作执行', content: '生成指令帮助文档' }],
    }),
  },
  '/status': {
    category: '系统管理',
    description: '显示系统状态',
    execute: () => ({
      response: `## 📊 系统状态

**连接状态**：✅ 已连接
**模型类型**：🖥️ 本地模型运行中 (Hermes-4 Pro)
**配额使用**：📈 85%
**定时任务**：⏰ 5个待执行

### 🤖 智能体状态
| 智能体 | 状态 | 角色 |
|--------|------|------|
| JARVIS | 🟢 在线 | 基础设施守护者 |
| HERMES | 🟢 在线 | 邮件管道 |
| CHRONOS | 🟢 在线 | 时间架构师 |
| LEDGER | 🟡 忙碌 | 财务管家 |
| CYRANO | 🟢 在线 | 文案助手 |
| MYTHOS | 🟢 在线 | 深度推理专家 |

### 🧠 自动技能
已生成：3个
- 每日邮件分类规则
- 会议纪要生成
- 周报自动生成`,
      steps: [
        { step: '状态查询', content: '获取系统连接状态' },
        { step: '模型检查', content: '验证本地模型运行状态' },
        { step: '智能体检索', content: '检查各智能体运行状态' },
        { step: '任务检查', content: '扫描待执行定时任务' },
        { step: '技能统计', content: '统计自动生成技能数量' },
      ],
    }),
  },
  '/clear': {
    category: '系统管理',
    description: '清空对话记录',
    execute: () => ({
      response: '✅ 对话已清空',
      steps: [{ step: '确认操作', content: '用户请求清空对话' }, { step: '执行清空', content: '清除所有对话记录' }, { step: '状态更新', content: '重置对话状态' }],
    }),
  },
  '/agent': {
    category: '智能体管理',
    description: '管理智能体',
    execute: (args) => {
      const action = args[0]?.toLowerCase();
      if (!action) {
        return {
          response: '❌ 参数错误：请指定操作，如 /agent list',
          steps: [{ step: '指令识别', content: '检测到指令: /agent' }, { step: '参数验证', content: '缺少操作参数' }, { step: '错误处理', content: '返回参数缺失错误' }],
        };
      }
      if (action === 'list') {
        return {
          response: `## 🤖 智能体列表

${AGENTS.map(a => `### ${a.name}
**角色**：${a.role}
**状态**：${a.status === 'online' ? '🟢 在线' : a.status === 'busy' ? '🟡 忙碌' : '🔴 离线'}
**描述**：${a.description}`).join('\n\n')}`,
          steps: [{ step: '指令识别', content: '检测到指令: /agent list' }, { step: '智能体检索', content: '从智能体注册表获取列表' }, { step: '状态聚合', content: '收集各智能体运行状态' }, { step: '响应生成', content: '格式化显示智能体信息' }],
        };
      }
      if (action === 'start') {
        const agentName = args[1]?.toUpperCase();
        const agent = AGENTS.find(a => a.name === agentName);
        if (!agentName) {
          return {
            response: '❌ 参数错误：请指定智能体名称，如 /agent start JARVIS',
            steps: [{ step: '指令识别', content: '检测到指令: /agent start' }, { step: '参数验证', content: '缺少智能体名称' }, { step: '错误处理', content: '返回参数缺失错误' }],
          };
        }
        if (!agent) {
          return {
            response: `❌ 未找到智能体: ${agentName}。可用智能体: ${AGENTS.map(a => a.name).join(', ')}`,
            steps: [{ step: '指令识别', content: `检测到指令: /agent start ${agentName}` }, { step: '智能体检索', content: `未找到智能体 "${agentName}"` }, { step: '错误处理', content: '返回智能体不存在错误' }],
          };
        }
        return {
          response: `✅ 智能体 ${agentName} 已启动`,
          steps: [{ step: '指令识别', content: `检测到指令: /agent start ${agentName}` }, { step: '智能体启动', content: `启动智能体 ${agentName}` }, { step: '状态更新', content: `更新 ${agentName} 状态为在线` }],
        };
      }
      if (action === 'stop') {
        const agentName = args[1]?.toUpperCase();
        const agent = AGENTS.find(a => a.name === agentName);
        if (!agentName) {
          return {
            response: '❌ 参数错误：请指定智能体名称，如 /agent stop JARVIS',
            steps: [{ step: '指令识别', content: '检测到指令: /agent stop' }, { step: '参数验证', content: '缺少智能体名称' }, { step: '错误处理', content: '返回参数缺失错误' }],
          };
        }
        if (!agent) {
          return {
            response: `❌ 未找到智能体: ${agentName}。可用智能体: ${AGENTS.map(a => a.name).join(', ')}`,
            steps: [{ step: '指令识别', content: `检测到指令: /agent stop ${agentName}` }, { step: '智能体检索', content: `未找到智能体 "${agentName}"` }, { step: '错误处理', content: '返回智能体不存在错误' }],
          };
        }
        return {
          response: `✅ 智能体 ${agentName} 已停止`,
          steps: [{ step: '指令识别', content: `检测到指令: /agent stop ${agentName}` }, { step: '智能体停止', content: `停止智能体 ${agentName}` }, { step: '状态更新', content: `更新 ${agentName} 状态为离线` }],
        };
      }
      return {
        response: `❌ 未知操作: ${action}。可用操作: list, start, stop`,
        steps: [{ step: '指令识别', content: `检测到指令: /agent ${action}` }, { step: '操作验证', content: `操作 "${action}" 不存在` }, { step: '错误处理', content: '返回操作不存在错误' }],
      };
    },
  },
  '/model': {
    category: '模型管理',
    description: '管理AI模型',
    execute: (args) => {
      const action = args[0]?.toLowerCase();
      if (!action) {
        return {
          response: '❌ 参数错误：请指定操作，如 /model list',
          steps: [{ step: '指令识别', content: '检测到指令: /model' }, { step: '参数验证', content: '缺少操作参数' }, { step: '错误处理', content: '返回参数缺失错误' }],
        };
      }
      if (action === 'list') {
        return {
          response: `## 🤖 可用模型

${MODELS.map(m => `### ${m.name}`).join('\n')}`,
          steps: [{ step: '指令识别', content: '检测到指令: /model list' }, { step: '模型检索', content: '从模型注册表获取列表' }, { step: '响应生成', content: '格式化显示模型信息' }],
        };
      }
      if (action === 'select') {
        const modelName = args.slice(1).join(' ');
        if (!modelName) {
          return {
            response: '❌ 参数错误：请指定模型名称，如 /model select Hermes-4 Pro',
            steps: [{ step: '指令识别', content: '检测到指令: /model select' }, { step: '参数验证', content: '缺少模型名称' }, { step: '错误处理', content: '返回参数缺失错误' }],
          };
        }
        return {
          response: `✅ 已切换到模型: ${modelName}\n\n正在加载模型配置...\n预计完成时间：约10秒`,
          steps: [{ step: '指令识别', content: `检测到指令: /model select ${modelName}` }, { step: '模型验证', content: `验证模型 "${modelName}" 可用` }, { step: '配置更新', content: '更新当前模型配置' }, { step: '加载模型', content: '初始化模型实例' }],
        };
      }
      if (action === 'auto') {
        return {
          response: `## 🔄 智能模型路由已启用

**路由策略**：
- 🟢 简单任务 → Llama 3.3 70B (低成本)
- 🟡 中等任务 → Claude 3.5 Sonnet (平衡)
- 🔴 复杂任务 → Hermes-4 Pro / GPT-4o (高性能)

系统将根据任务复杂度自动选择最优模型。`,
          steps: [{ step: '指令识别', content: '检测到指令: /model auto' }, { step: '策略配置', content: '启用智能模型选择策略' }, { step: '状态更新', content: '更新路由配置为自动模式' }],
        };
      }
      return {
        response: `❌ 未知操作: ${action}。可用操作: list, select, auto`,
        steps: [{ step: '指令识别', content: `检测到指令: /model ${action}` }, { step: '操作验证', content: `操作 "${action}" 不存在` }, { step: '错误处理', content: '返回操作不存在错误' }],
      };
    },
  },
  '/skill': {
    category: '技能管理',
    description: '管理自动技能',
    execute: (args) => {
      const action = args[0]?.toLowerCase();
      if (!action) {
        return {
          response: '❌ 参数错误：请指定操作，如 /skill list',
          steps: [{ step: '指令识别', content: '检测到指令: /skill' }, { step: '参数验证', content: '缺少操作参数' }, { step: '错误处理', content: '返回参数缺失错误' }],
        };
      }
      if (action === 'list') {
        return {
          response: `## 🧠 自动技能列表

### 1. 每日邮件分类规则
- 触发条件：邮件主题包含URGENT或VIP发件人
- 置信度：92%
- 优化次数：5次

### 2. 会议纪要生成
- 触发条件：收到会议记录邮件
- 置信度：87%
- 优化次数：3次

### 3. 周报自动生成
- 触发条件：每周一08:00
- 置信度：95%
- 优化次数：8次`,
          steps: [{ step: '指令识别', content: '检测到指令: /skill list' }, { step: '技能检索', content: '从技能库获取自动技能' }, { step: '响应生成', content: '格式化显示技能信息' }],
        };
      }
      if (action === 'train') {
        return {
          response: `## 🚀 开始训练新技能

**训练流程**：
1. 📊 分析历史对话数据
2. 🔍 识别重复模式和成功案例
3. ✨ 生成技能定义
4. 🧪 在沙盒环境测试
5. 💾 验证通过后保存到技能库

预计完成时间：约30秒`,
          steps: [{ step: '指令识别', content: '检测到指令: /skill train' }, { step: '数据收集', content: '收集历史对话和任务数据' }, { step: '模式识别', content: '识别可自动化的模式' }, { step: '技能生成', content: '生成新的自动技能定义' }, { step: '测试验证', content: '在沙盒环境中测试技能' }, { step: '持久化', content: '将技能保存到技能库' }],
        };
      }
      return {
        response: `❌ 未知操作: ${action}。可用操作: list, train`,
        steps: [{ step: '指令识别', content: `检测到指令: /skill ${action}` }, { step: '操作验证', content: `操作 "${action}" 不存在` }, { step: '错误处理', content: '返回操作不存在错误' }],
      };
    },
  },
  '/memory': {
    category: '记忆管理',
    description: '管理多层次记忆系统',
    execute: (args) => {
      const action = args[0]?.toLowerCase();
      if (!action) {
        return {
          response: '❌ 参数错误：请指定操作，如 /memory list',
          steps: [{ step: '指令识别', content: '检测到指令: /memory' }, { step: '参数验证', content: '缺少操作参数' }, { step: '错误处理', content: '返回参数缺失错误' }],
        };
      }
      if (action === 'list') {
        return {
          response: `## 💾 记忆系统内容

### 📝 会话记忆
- 用户偏好使用深色主题
- 当前正在处理API文档编写任务

### 🔒 持久记忆
- 用户是软件开发者，主要使用Python和JavaScript
- 用户每周一会生成周报

### 🧠 技能记忆
- 用户经常询问代码生成相关问题，偏好简洁的代码风格`,
          steps: [{ step: '指令识别', content: '检测到指令: /memory list' }, { step: '记忆检索', content: '从三个记忆层获取数据' }, { step: '响应生成', content: '分类显示记忆内容' }],
        };
      }
      if (action === 'clear') {
        const type = args[1]?.toLowerCase();
        const typeNames: Record<string, string> = { session: '会话记忆', persistent: '持久记忆', skill: '技能记忆' };
        if (!type) {
          return {
            response: '✅ 所有记忆已清空',
            steps: [{ step: '指令识别', content: '检测到指令: /memory clear' }, { step: '确认操作', content: '确认清空所有记忆' }, { step: '执行清空', content: '清除会话、持久和技能记忆' }],
          };
        }
        if (!typeNames[type]) {
          return {
            response: `❌ 无效类型: ${type}。可用类型: ${Object.keys(typeNames).join(', ')}`,
            steps: [{ step: '指令识别', content: `检测到指令: /memory clear ${type}` }, { step: '类型验证', content: `类型 "${type}" 不存在` }, { step: '错误处理', content: '返回类型不存在错误' }],
          };
        }
        return {
          response: `✅ ${typeNames[type]}已清空`,
          steps: [{ step: '指令识别', content: `检测到指令: /memory clear ${type}` }, { step: '确认操作', content: `确认清空${typeNames[type]}` }, { step: '执行清空', content: `清除${typeNames[type]}` }],
        };
      }
      return {
        response: `❌ 未知操作: ${action}。可用操作: list, clear`,
        steps: [{ step: '指令识别', content: `检测到指令: /memory ${action}` }, { step: '操作验证', content: `操作 "${action}" 不存在` }, { step: '错误处理', content: '返回操作不存在错误' }],
      };
    },
  },
  '/open': {
    category: '应用操作',
    description: '打开应用程序',
    execute: (args) => {
      const app = args[0]?.toLowerCase();
      const apps: Record<string, string> = {
        chrome: 'Chrome 浏览器', terminal: '终端', vscode: 'VS Code', finder: '文件管理器',
        notepad: '记事本', calculator: '计算器', safari: 'Safari 浏览器',
        mail: '邮件', music: '音乐', photos: '照片',
      };
      if (!app) {
        return {
          response: '❌ 参数错误：请指定要打开的应用，如 /open chrome',
          steps: [{ step: '指令识别', content: '检测到指令: /open' }, { step: '参数验证', content: '缺少应用名称参数' }, { step: '错误处理', content: '返回参数缺失错误' }],
        };
      }
      if (!apps[app]) {
        return {
          response: `❌ 无法识别应用: ${app}。可用应用: ${Object.keys(apps).join(', ')}`,
          steps: [{ step: '指令识别', content: `检测到指令: /open ${app}` }, { step: '应用查找', content: `未找到应用 "${app}"` }, { step: '错误处理', content: '返回应用未找到错误' }],
        };
      }
      return {
        response: `正在打开 ${apps[app]}...`,
        steps: [{ step: '指令识别', content: `检测到指令: /open ${app}` }, { step: '应用查找', content: `定位应用程序: ${apps[app]}` }, { step: '操作执行', content: `启动 ${apps[app]}` }, { step: '状态反馈', content: '返回操作结果' }],
      };
    },
  },
  '/search': {
    category: '浏览器操作',
    description: '在浏览器中搜索',
    execute: (args) => {
      const query = args.join(' ');
      if (!query) {
        return {
          response: '❌ 参数错误：请指定搜索关键词，如 /search 天气',
          steps: [{ step: '指令识别', content: '检测到指令: /search' }, { step: '参数验证', content: '缺少搜索关键词' }, { step: '错误处理', content: '返回参数缺失错误' }],
        };
      }
      return {
        response: `正在搜索: "${query}"...`,
        steps: [{ step: '指令识别', content: `检测到指令: /search ${query}` }, { step: '搜索处理', content: `构建搜索查询: ${query}` }, { step: '操作执行', content: '打开浏览器执行搜索' }],
        toolCall: { name: 'web_search', description: '执行网络搜索', params: { query } },
      };
    },
  },
  '/navigate': {
    category: '浏览器操作',
    description: '导航到指定网址',
    execute: (args) => {
      const url = args.join(' ');
      if (!url) {
        return {
          response: '❌ 参数错误：请指定网址，如 /navigate https://www.example.com',
          steps: [{ step: '指令识别', content: '检测到指令: /navigate' }, { step: '参数验证', content: '缺少网址参数' }, { step: '错误处理', content: '返回参数缺失错误' }],
        };
      }
      const isValidUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(url);
      if (!isValidUrl && !url.includes('.')) {
        return {
          response: `❌ 无效网址: ${url}。请输入有效的URL地址`,
          steps: [{ step: '指令识别', content: `检测到指令: /navigate ${url}` }, { step: 'URL验证', content: '网址格式无效' }, { step: '错误处理', content: '返回网址格式错误' }],
        };
      }
      return {
        response: `正在打开网址: ${url}...`,
        steps: [{ step: '指令识别', content: `检测到指令: /navigate ${url}` }, { step: 'URL验证', content: '验证网址格式' }, { step: '操作执行', content: '在浏览器中打开网址' }],
      };
    },
  },
  '/config': {
    category: '应用配置',
    description: '配置系统设置',
    execute: (args) => {
      const setting = args[0]?.toLowerCase();
      const value = args[1];
      if (!setting) {
        return {
          response: '❌ 参数错误：请指定配置项，如 /config theme dark',
          steps: [{ step: '指令识别', content: '检测到指令: /config' }, { step: '参数验证', content: '缺少配置项参数' }, { step: '错误处理', content: '返回参数缺失错误' }],
        };
      }
      if (setting === 'theme') {
        if (!value) {
          return {
            response: '❌ 参数错误：请指定主题值，如 /config theme dark',
            steps: [{ step: '指令识别', content: '检测到指令: /config theme' }, { step: '参数验证', content: '缺少主题值参数' }, { step: '错误处理', content: '返回参数缺失错误' }],
          };
        }
        if (value === 'dark') {
          return {
            response: '✅ 已设置为深色主题',
            steps: [{ step: '指令识别', content: '检测到指令: /config theme dark' }, { step: '主题切换', content: '切换到深色主题' }, { step: '状态更新', content: '保存主题设置' }],
          };
        }
        if (value === 'light') {
          return {
            response: '✅ 已设置为浅色主题',
            steps: [{ step: '指令识别', content: '检测到指令: /config theme light' }, { step: '主题切换', content: '切换到浅色主题' }, { step: '状态更新', content: '保存主题设置' }],
          };
        }
        return {
          response: `❌ 无效主题值: ${value}。可用值: dark, light`,
          steps: [{ step: '指令识别', content: `检测到指令: /config theme ${value}` }, { step: '值验证', content: `主题值 "${value}" 无效` }, { step: '错误处理', content: '返回无效值错误' }],
        };
      }
      return {
        response: `❌ 未知配置项: ${setting}。可用配置: theme`,
        steps: [{ step: '指令识别', content: `检测到指令: /config ${setting}` }, { step: '配置验证', content: `配置项 "${setting}" 不存在` }, { step: '错误处理', content: '返回配置项不存在错误' }],
      };
    },
  },
};

const App = () => {
  const [activeSection, setActiveSection] = useState('task-all-tasks');
  const [selectedTab, setSelectedTab] = useState('assistant');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好！我是意念AI，您的智能助手。\n\n我支持以下功能：\n\n**🤖 智能体系统**\n- JARVIS - 基础设施守护者\n- HERMES - 邮件管道\n- CHRONOS - 时间架构师\n- LEDGER - 财务管家\n- CYRANO - 文案助手\n- MYTHOS - 深度推理专家\n\n**🧠 模型管理**\n- Hermes-4 Pro（本地）\n- GPT-4o（云端）\n- Claude 3.5 Sonnet\n- Llama 3.3 70B\n- Mistral Large 2\n\n**💡 指令系统**\n输入 `/help` 查看所有可用指令\n\n请问我可以帮您做什么？',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), message: '系统已启动', type: 'success' },
    { timestamp: new Date().toLocaleTimeString(), message: '本地模型 Hermes-4 Pro 加载成功', type: 'success' },
    { timestamp: new Date().toLocaleTimeString(), message: '智能体系统初始化完成', type: 'info' },
    { timestamp: new Date().toLocaleTimeString(), message: '6个智能体已注册', type: 'info' },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [messageType, setMessageType] = useState<'text' | 'voice' | 'image' | 'file'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentModel, setCurrentModel] = useState('Hermes-4 Pro');
  const [connectionMode, setConnectionMode] = useState<'local' | 'cloud' | 'auto'>('local');
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-49), { timestamp: new Date().toLocaleTimeString(), message, type }]);
  };

  const executeCommand = (command: string): { response: string; steps: ThinkingStep[]; toolCall?: ToolCall } | null => {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (COMMANDS[cmd]) {
      return COMMANDS[cmd].execute(args);
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
        setMessages([]);
        addLog('对话已清空', 'info');
      }
    } else {
      setIsThinking(true);
      const thinking = [
        { step: '意图分析', content: '分析用户输入意图' },
        { step: '知识检索', content: '检索相关知识库' },
        { step: '模型推理', content: `使用${currentModel}进行推理` },
        { step: '响应生成', content: '生成自然语言响应' },
      ];
      setThinkingSteps(thinking);

      for (let i = 0; i < thinking.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setThinkingSteps(prev => prev.map((step, idx) => idx <= i ? { ...step, completed: true } : step));
      }

      // 智能响应生成
      const generateResponse = (input: string): string => {
        const lowerInput = input.toLowerCase();

        // 问候类
        if (lowerInput.match(/你好|您好|hello|hi|嗨|早上好|晚上好/)) {
          return '您好！我是意念AI，很高兴为您服务！有什么我可以帮助您的吗？';
        }

        // 自我介绍
        if (lowerInput.match(/你是谁|介绍一下|什么.*ai|你的名字/)) {
          return '我是**意念AI**，一个智能助手平台。\n\n我具备以下能力：\n- 🤖 智能对话与问答\n- 📋 任务管理与调度\n- 📁 文件管理与处理\n- 🔧 系统配置与控制\n- 🧠 多模型支持（本地/云端）\n\n请问有什么可以帮您？';
        }

        // 功能询问
        if (lowerInput.match(/能做什么|功能|有什么用|怎么用/)) {
          return '我可以帮您完成以下任务：\n\n**💬 智能对话**\n- 回答问题、提供建议\n- 文本生成与编辑\n\n**📋 任务管理**\n- 创建、编辑、删除任务\n- 设置优先级和截止日期\n\n**📁 文件操作**\n- 上传、预览、下载文件\n- 文件重命名和删除\n\n**⚙️ 系统控制**\n- 配置连接模式\n- 切换AI模型\n- 设置定时任务\n\n**🤖 智能体系统**\n- JARVIS: 系统监控\n- HERMES: 邮件处理\n- CHRONOS: 日程管理\n- LEDGER: 财务管理\n- CYRANO: 文案创作';
        }

        // 天气
        if (lowerInput.match(/天气|温度|下雨|晴天/)) {
          return '抱歉，我目前无法获取实时天气数据。\n\n您可以尝试以下方式：\n- 使用指令 `/search 天气 [城市名]` 搜索天气信息\n- 访问天气网站获取实时数据\n\n我会在未来版本中集成天气API。';
        }

        // 时间
        if (lowerInput.match(/时间|几点|日期|今天/)) {
          const now = new Date();
          const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
          return `当前时间：**${now.toLocaleTimeString()}**\n\n今天是 ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekdays[now.getDay()]}`;
        }

        // 帮助
        if (lowerInput.match(/帮助|help|怎么操作/)) {
          return '以下是我支持的指令：\n\n**系统指令**\n- `/help` - 显示帮助信息\n- `/clear` - 清空对话\n- `/status` - 查看系统状态\n- `/time` - 显示当前时间\n\n**应用控制**\n- `/open [应用名]` - 打开应用\n- `/close [应用名]` - 关闭应用\n\n**搜索**\n- `/search [关键词]` - 搜索内容\n\n**配置**\n- `/config theme [dark/light]` - 切换主题';
        }

        // 感谢
        if (lowerInput.match(/谢谢|感谢|thanks|thank/)) {
          return '不客气！很高兴能帮到您。如果还有其他问题，随时可以问我！';
        }

        // 再见
        if (lowerInput.match(/再见|拜拜|bye|goodbye/)) {
          return '再见！期待下次与您交流。祝您生活愉快！';
        }

        // 编程相关
        if (lowerInput.match(/代码|编程|python|javascript|java|html|css/)) {
          return '我可以帮助您解决编程问题！请告诉我具体的需求，例如：\n\n- 某种语言的语法问题\n- 代码调试\n- 算法实现\n- 最佳实践建议\n\n请详细描述您的问题，我会尽力帮助您。';
        }

        // 学习相关
        if (lowerInput.match(/学习|教程|怎么学|入门/)) {
          return '学习建议：\n\n1. **明确目标** - 确定您想学习的领域\n2. **制定计划** - 分解学习任务\n3. **实践为主** - 多动手练习\n4. **持续迭代** - 不断复习和提升\n\n您想学习哪个领域？我可以提供更具体的建议。';
        }

        // 默认响应
        const truncatedInput = input.substring(0, 20);
        return `我收到了您的问题："${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"\n\n让我来分析一下：\n\n这是一个很好的问题！为了给您更准确的回答，您可以：\n\n1. 提供更多背景信息\n2. 说明具体的使用场景\n3. 或者使用指令 /search ${truncatedInput} 进行搜索\n\n我会尽力帮助您解决问题。`;
      };

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: generateResponse(content),
        sender: 'assistant',
        timestamp: new Date(),
        thinking,
      };

      setMessages(prev => [...prev, assistantMessage]);
      addLog('助手响应完成', 'success');
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
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    addLog('开始语音录制', 'info');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    addLog('语音录制完成', 'success');
    setInputValue('(语音消息) 您好，我是意念AI');
  };

  const renderContent = () => {
    if (selectedTab === 'tasks') {
      const filter = activeSection.split('-')[1] || 'all';
      return <TaskPanel filter={filter as 'all' | 'in_progress' | 'completed'} />;
    }
    if (selectedTab === 'files') {
      return <FileManager />;
    }
    if (activeSection === 'setting-scheduled') {
      return <ScheduledTasks />;
    }
    if (activeSection === 'setting-update') {
      return <SystemUpdate />;
    }
    if (activeSection.startsWith('agent-')) {
      return <AgentPanel agentId={activeSection} />;
    }
    if (activeSection.startsWith('skill-')) {
      return <SkillCenter skillId={activeSection} />;
    }
    if (activeSection === 'setting-connection' || activeSection === 'setting-model') {
      return <SystemSettings activeTab={activeSection} />;
    }
    return (
      <div className="flex-1 flex flex-col bg-gray-900">
        <div className="flex items-center justify-between px-6 py-3 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`}></div>
              <span className="text-sm text-gray-400">{connectionMode === 'local' ? '本地模型' : connectionMode === 'cloud' ? '云端模型' : '自动模式'}</span>
            </div>
            <div className="text-sm text-gray-400">|</div>
            <div className="text-sm text-gray-300">当前模型: <span className="text-blue-400">{currentModel}</span></div>
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
          <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
            <div className="min-w-full max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
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
              ))}
              
              {isThinking && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-300">AI</div>
                  <div className="max-w-[70%]">
                    <div className="inline-block px-4 py-2 rounded-2xl bg-gray-800 rounded-bl-md">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-gray-400 text-sm">思考中...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {thinkingSteps.length > 0 && (
            <div className="w-72 bg-gray-800/50 border-l border-gray-700 p-4 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                思考过程
              </h3>
              <div className="space-y-2">
                {thinkingSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-2 rounded-lg ${step.completed ? 'bg-gray-700/50' : 'bg-gray-800'}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
                      {step.completed ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-medium ${step.completed ? 'text-green-400' : 'text-gray-300'}`}>{step.step}</div>
                      <div className="text-xs text-gray-400 mt-1">{step.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-3">
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
                {messageType === 'voice' ? (
                  <button
                    onClick={handleStartRecording}
                    className="p-3 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                ) : messageType === 'image' ? (
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
            <div className="mt-2 flex items-center gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm text-gray-300">{file.name}</span>
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

        <div className="h-16 bg-gray-900 border-t border-gray-800 overflow-hidden">
          <div className="h-full flex items-center px-4 gap-1 overflow-x-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
              <span className="text-xs text-gray-400">快捷指令:</span>
            </div>
            {['/status', '/agent list', '/model list', '/skill list'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => setInputValue(cmd)}
                className="px-3 py-2 bg-gray-800/50 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                {cmd}
              </button>
            ))}
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-xs text-gray-500">
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
    <div className="h-screen flex bg-gray-900 text-white overflow-hidden">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-lg font-bold">意</span>
              </div>
              <span className="font-semibold text-lg">意念AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTab('assistant')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTab === 'assistant' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              智能助手
            </button>
            <button
              onClick={() => setSelectedTab('tasks')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTab === 'tasks' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              任务中心
            </button>
            <button
              onClick={() => setSelectedTab('files')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTab === 'files' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              文件管理
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>

        {selectedTab === 'assistant' && (
          <div className="h-20 bg-gray-900/50 border-t border-gray-800 overflow-hidden">
            <div className="h-full flex items-center px-4 gap-2 overflow-x-auto">
              <div className="text-xs text-gray-500 mr-2">系统日志:</div>
              {logs.slice(-8).map((log, index) => (
                <div key={index} className="flex items-center gap-2 px-2 py-1">
                  <span className={`text-xs ${log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHelp(false)}>
          <div className="bg-gray-800 rounded-xl w-[600px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h2 className="font-semibold">指令帮助</h2>
              <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: COMMANDS['/help'].execute([]).response.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;