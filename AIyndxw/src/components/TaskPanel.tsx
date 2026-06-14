import React, { useState } from 'react';
import { Task } from '../types';
import { mockTasks } from '../data/mockData';

interface TaskPanelProps {
  filter?: 'all' | 'in_progress' | 'completed';
}

const TaskPanel: React.FC<TaskPanelProps> = ({ filter = 'all' }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusLabel = (status: Task['status']) => {
    const labels = {
      pending: '待处理',
      in_progress: '进行中',
      completed: '已完成',
    };
    return labels[status];
  };

  const getStatusColor = (status: Task['status']) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      in_progress: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'border-gray-600',
      medium: 'border-yellow-500',
      high: 'border-red-500',
    };
    return colors[priority];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date() } : task
    ));
  };

  const handleEditStart = (task: Task) => {
    setEditTitle(task.title);
    setEditingTaskId(task.id);
  };

  const handleEditSave = (taskId: string) => {
    if (editTitle.trim()) {
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, title: editTitle.trim(), updatedAt: new Date() } : task
      ));
    }
    setEditingTaskId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
    setEditTitle('');
  };

  const handleDelete = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      if (expandedTaskId === taskId) {
        setExpandedTaskId(null);
      }
    }
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">任务列表</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">共 {filteredTasks.length} 个任务</span>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            className={`bg-gray-800/50 rounded-lg border-l-2 ${getPriorityColor(task.priority)} overflow-hidden`}
          >
            <div
              onClick={() => toggleExpand(task.id)}
              className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedTaskId === task.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {editingTaskId === task.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="px-2 py-1 bg-gray-700 border border-blue-500 rounded text-white text-sm focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditSave(task.id); }}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500"
                        >
                          保存
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditCancel(); }}
                          className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-medium text-gray-200">{task.title}</h3>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditStart(task); }}
                          className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                          title="编辑任务名称"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                    <span className={`text-xs ${task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{task.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>创建: {formatDate(task.createdAt)}</span>
                    <span>更新: {formatDate(task.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {task.status !== 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task.id, 'completed');
                      }}
                      className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      完成
                    </button>
                  )}
                  {task.status !== 'in_progress' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task.id, 'in_progress');
                      }}
                      className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      开始
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(task.id);
                    }}
                    className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>

            {expandedTaskId === task.id && (
              <div className="px-4 pb-4 pt-2 bg-gray-800/30 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">任务状态</div>
                    <div className={`text-sm px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">优先级</div>
                    <div className={`text-sm ${task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {task.priority === 'high' ? '🔴 高' : task.priority === 'medium' ? '🟡 中' : '⚪ 低'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">创建时间</div>
                    <div className="text-sm text-gray-400">{new Date(task.createdAt).toLocaleString('zh-CN')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">最后更新</div>
                    <div className="text-sm text-gray-400">{new Date(task.updatedAt).toLocaleString('zh-CN')}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-1">任务详情</div>
                  <div className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded-lg">
                    {task.description || '暂无详细描述'}
                  </div>
                </div>

                {task.status === 'in_progress' && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">⏳ 进行中 - 预计完成时间</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">约 60% 完成</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">暂无任务</p>
        </div>
      )}
    </div>
  );
};

export default TaskPanel;
