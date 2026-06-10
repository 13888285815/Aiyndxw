import React, { useState } from 'react';
import { mockAgents } from '../data/mockData';

interface AgentPanelProps {
  agentId: string;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ agentId }) => {
  const [agents, setAgents] = useState(mockAgents);
  const agent = agents.find((a) => `agent-${a.id}` === agentId);
  const [selectedAgent, setSelectedAgent] = useState(agent || null);
  const [isStarting, setIsStarting] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  if (!agent) {
    return (
      <div className="h-full p-6">
        <h2 className="text-xl font-semibold text-white mb-6">智能体</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelectedAgent(a)}
              className={`bg-gray-800/50 rounded-xl p-4 border transition-colors cursor-pointer ${
                selectedAgent?.id === a.id ? 'border-blue-500' : 'border-gray-700 hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  a.status === 'online' ? 'bg-green-500/20' : 
                  a.status === 'busy' ? 'bg-yellow-500/20' : 'bg-gray-500/20'
                }`}>
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">{a.name}</h3>
                  <span className={`text-xs ${
                    a.status === 'online' ? 'text-green-400' : 
                    a.status === 'busy' ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {a.status === 'online' ? '在线' : a.status === 'busy' ? '忙碌' : '离线'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
          agent.status === 'online' ? 'bg-green-500/20' : 
          agent.status === 'busy' ? 'bg-yellow-500/20' : 'bg-gray-500/20'
        }`}>
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={agent.icon} />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">{agent.name}</h2>
          <span className={`text-sm ${
            agent.status === 'online' ? 'text-green-400' : 
            agent.status === 'busy' ? 'text-yellow-400' : 'text-gray-500'
          }`}>
            {agent.status === 'online' ? '在线' : agent.status === 'busy' ? '忙碌' : '离线'}
          </span>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
        <p className="text-gray-300">{agent.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">职责范围</h3>
          <ul className="space-y-2 text-sm">
            {getAgentResponsibilities(agent.name).map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">操作</h3>
          <div className="space-y-2">
            {agent.status === 'online' ? (
              <button
                onClick={() => {
                  if (confirm(`确定要停止 ${agent.name} 吗？`)) {
                    setAgents(prev => prev.map(a =>
                      a.id === agent.id ? { ...a, status: 'offline' as const } : a
                    ));
                  }
                }}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                停止智能体
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsStarting(true);
                  setTimeout(() => {
                    setAgents(prev => prev.map(a =>
                      a.id === agent.id ? { ...a, status: 'online' as const } : a
                    ));
                    setIsStarting(false);
                  }, 1500);
                }}
                disabled={isStarting}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isStarting ? '启动中...' : '启动智能体'}
              </button>
            )}
            <button
              onClick={() => setShowLogs(true)}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              查看日志
            </button>
            <button
              onClick={() => setShowConfig(true)}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              配置参数
            </button>
          </div>
        </div>
      </div>

      {showLogs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLogs(false)}>
          <div className="bg-gray-800 rounded-xl w-[700px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h2 className="font-semibold text-white">{agent.name} - 运行日志</h2>
              <button onClick={() => setShowLogs(false)} className="p-1 hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)] bg-gray-900/50">
              <div className="space-y-2 font-mono text-sm">
                {[
                  { time: '10:23:45', msg: '[INFO] 智能体启动成功', type: 'text-green-400' },
                  { time: '10:23:46', msg: '[INFO] 连接到主控系统', type: 'text-blue-400' },
                  { time: '10:24:01', msg: '[INFO] 接收任务: 系统健康检查', type: 'text-blue-400' },
                  { time: '10:24:02', msg: '[INFO] 执行系统监控...', type: 'text-blue-400' },
                  { time: '10:24:05', msg: '[SUCCESS] 所有系统组件运行正常', type: 'text-green-400' },
                  { time: '10:25:30', msg: '[INFO] 接收任务: 内存清理', type: 'text-blue-400' },
                  { time: '10:25:32', msg: '[INFO] 清理完成，释放内存: 256MB', type: 'text-green-400' },
                ].map((log, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="text-gray-500">{log.time}</span>
                    <span className={log.type}>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowConfig(false)}>
          <div className="bg-gray-800 rounded-xl w-[500px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-white">{agent.name} - 参数配置</h2>
              <button onClick={() => setShowConfig(false)} className="p-1 hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">最大并发任务数</label>
                <input
                  type="number"
                  defaultValue="5"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">响应超时时间 (秒)</label>
                <input
                  type="number"
                  defaultValue="30"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">自动重试次数</label>
                <input
                  type="number"
                  defaultValue="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="autoStart" className="w-4 h-4" />
                <label htmlFor="autoStart" className="text-sm text-gray-400">系统启动时自动运行</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowConfig(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    alert('配置已保存！');
                    setShowConfig(false);
                  }}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  保存配置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getAgentResponsibilities(agentName: string): string[] {
  const responsibilities: Record<string, string[]> = {
    JARVIS: [
      '系统健康监控',
      'Docker服务管理',
      '工作空间版本控制',
      '长期记忆整合',
      '主动告警通知',
    ],
    HERMES: [
      'IMAP邮箱读取',
      '智能邮件分类',
      '每日简报生成',
      '标准回复发送',
      '条件转发处理',
    ],
    CHRONOS: [
      '日程读取与更新',
      '晨间简报生成',
      '可用时间查询',
      '会议冲突检测',
      '提醒协调管理',
    ],
    LEDGER: [
      '发票处理',
      '支出跟踪',
      '财务报告生成',
      '预算管理',
      '账单提醒',
    ],
    CYRANO: [
      '邮件撰写',
      '文档生成',
      '内容优化',
      '翻译支持',
      '创意写作',
    ],
  };
  return responsibilities[agentName] || [];
}

export default AgentPanel;