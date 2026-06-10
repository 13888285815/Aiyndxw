import React, { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const taskCenter = [
    { id: 'all-tasks', label: '全部任务', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'in-progress', label: '进行中', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', count: 3 },
    { id: 'completed', label: '已完成', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', count: 12 },
  ];

  const agents = [
    { id: '1', label: 'JARVIS', description: '基础设施守护者', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', status: 'online' },
    { id: '2', label: 'HERMES', description: '邮件管道', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', status: 'online' },
    { id: '3', label: 'CHRONOS', description: '时间架构师', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', status: 'online' },
    { id: '4', label: 'LEDGER', description: '财务管家', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', status: 'busy' },
    { id: '5', label: 'CYRANO', description: '文案助手', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', status: 'online' },
  ];

  const skills = [
    { id: 'skill-store', label: '技能商店', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    { id: 'my-skills', label: '我的技能', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', count: 8 },
  ];

  const settings = [
    { id: 'connection', label: '连接设置', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'model', label: '模型管理', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { id: 'scheduled', label: '定时任务', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', status: 'warning' },
    { id: 'update', label: '系统更新', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4M6 16l4-4-4-4' },
  ];

  const renderIcon = (iconPath: string) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
    </svg>
  );

  const renderStatusDot = (status: string) => {
    const colorMap = {
      online: 'bg-green-500',
      offline: 'bg-gray-500',
      busy: 'bg-yellow-500',
      warning: 'bg-yellow-500',
    };
    return <span className={`ml-auto w-2 h-2 rounded-full ${colorMap[status as keyof typeof colorMap] || 'bg-gray-500'}`}></span>;
  };

  const renderCountBadge = (count: number) => (
    <span className="ml-auto text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">{count}</span>
  );

  const renderSection = (title: string, items: any[], sectionPrefix: string) => (
    <div className="mb-4">
      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</div>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSectionChange(`${sectionPrefix}-${item.id}`)}
          className={`px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
            activeSection === `${sectionPrefix}-${item.id}`
              ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-500'
              : 'text-gray-400 hover:bg-gray-800/50'
          }`}
        >
          {renderIcon(item.icon)}
          <div className="flex-1 text-left">
            <div className="text-sm">{item.label}</div>
            {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
          </div>
          {item.count && renderCountBadge(item.count)}
          {item.status && renderStatusDot(item.status)}
        </div>
      ))}
    </div>
  );

  return (
    <aside className="w-64 bg-[#0d1117] border-r border-gray-800 flex flex-col shrink-0">
      <div className="p-3 border-b border-gray-800">
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建任务
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {renderSection('任务中心', taskCenter, 'task')}
        {renderSection('智能体', agents, 'agent')}
        {renderSection('技能中心', skills, '')}
        {renderSection('系统设置', settings, 'setting')}
      </nav>

      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewTaskModal(false)}>
          <div className="bg-gray-800 rounded-xl w-[500px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">新建任务</h2>
              <button onClick={() => setShowNewTaskModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">任务标题</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="请输入任务标题"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">任务描述</label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="请输入任务描述"
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">优先级</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewTaskPriority('low')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      newTaskPriority === 'low' ? 'bg-gray-600 text-white border-2 border-blue-500' : 'bg-gray-700 text-gray-400 border-2 border-transparent'
                    }`}
                  >
                    低
                  </button>
                  <button
                    onClick={() => setNewTaskPriority('medium')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      newTaskPriority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500' : 'bg-gray-700 text-gray-400 border-2 border-transparent'
                    }`}
                  >
                    中
                  </button>
                  <button
                    onClick={() => setNewTaskPriority('high')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      newTaskPriority === 'high' ? 'bg-red-500/20 text-red-400 border-2 border-red-500' : 'bg-gray-700 text-gray-400 border-2 border-transparent'
                    }`}
                  >
                    高
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (newTaskTitle.trim()) {
                      alert('任务创建成功！');
                      setNewTaskTitle('');
                      setNewTaskDescription('');
                      setNewTaskPriority('medium');
                      setShowNewTaskModal(false);
                    }
                  }}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  创建任务
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;