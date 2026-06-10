import React, { useState } from 'react';
import { Task } from '../types';
import { mockTasks } from '../data/mockData';

interface TaskPanelProps {
  filter?: 'all' | 'in_progress' | 'completed';
}

const TaskPanel: React.FC<TaskPanelProps> = ({ filter = 'all' }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Task['priority']>('medium');

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

  const handleEditStart = () => {
    if (selectedTask) {
      setEditTitle(selectedTask.title);
      setEditDescription(selectedTask.description);
      setEditPriority(selectedTask.priority);
      setIsEditing(true);
    }
  };

  const handleEditSave = () => {
    if (selectedTask) {
      setTasks(prev => prev.map(task =>
        task.id === selectedTask.id ? {
          ...task,
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          updatedAt: new Date()
        } : task
      ));
      setSelectedTask(prev => prev ? {
        ...prev,
        title: editTitle,
        description: editDescription,
        priority: editPriority
      } : null);
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
        setIsEditing(false);
      }
    }
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">任务列表</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">共 {filteredTasks.length} 个任务</span>
          </div>
        </div>

        <div className="grid gap-3">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`p-4 bg-gray-800/50 rounded-lg border-l-2 cursor-pointer transition-all hover:bg-gray-800 ${getPriorityColor(task.priority)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-200">{task.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>创建: {formatDate(task.createdAt)}</span>
                    <span>更新: {formatDate(task.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {task.status !== 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task.id, 'completed');
                      }}
                      className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
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
                      className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                    >
                      开始
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTask && (
        <div className="w-80 bg-gray-800/50 border-l border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">任务详情</h3>
            <button
              onClick={() => {
                setSelectedTask(null);
                setIsEditing(false);
              }}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">标题</div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">描述</div>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">优先级</div>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Task['priority'])}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-700 space-y-2">
                <button
                  onClick={handleEditSave}
                  className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
                >
                  保存更改
                </button>
                <button
                  onClick={handleEditCancel}
                  className="w-full py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">标题</div>
                <div className="text-sm text-white">{selectedTask.title}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">描述</div>
                <div className="text-sm text-gray-300">{selectedTask.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">状态</div>
                  <div className={`text-sm px-2 py-1 rounded-full ${getStatusColor(selectedTask.status)}`}>
                    {getStatusLabel(selectedTask.status)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">优先级</div>
                  <div className={`text-sm ${selectedTask.priority === 'high' ? 'text-red-400' : selectedTask.priority === 'medium' ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {selectedTask.priority === 'high' ? '高' : selectedTask.priority === 'medium' ? '中' : '低'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">创建时间</div>
                  <div className="text-sm text-gray-400">{new Date(selectedTask.createdAt).toLocaleString('zh-CN')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">更新时间</div>
                  <div className="text-sm text-gray-400">{new Date(selectedTask.updatedAt).toLocaleString('zh-CN')}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700 space-y-2">
                <button
                  onClick={handleEditStart}
                  className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  编辑任务
                </button>
                <button
                  onClick={() => handleDelete(selectedTask.id)}
                  className="w-full py-2 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  删除任务
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskPanel;