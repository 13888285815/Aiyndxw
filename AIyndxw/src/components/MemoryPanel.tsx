import React, { useState } from 'react';
import { mockMemoryEntries, mockLearningInsights } from '../data/mockData';

const MemoryPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'memory' | 'insights'>('memory');
  const [memoryEntries, setMemoryEntries] = useState(mockMemoryEntries);
  const [insights, setInsights] = useState(mockLearningInsights);
  const [selectedEntry, setSelectedEntry] = useState<typeof mockMemoryEntries[0] | null>(null);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      session: 'bg-blue-500/20 text-blue-400',
      persistent: 'bg-purple-500/20 text-purple-400',
      skill: 'bg-green-500/20 text-green-400',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      session: '会话记忆',
      persistent: '持久记忆',
      skill: '技能记忆',
    };
    return labels[type] || type;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('确定要删除这个记忆条目吗？')) {
      setMemoryEntries(prev => prev.filter(e => e.id !== entryId));
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
    }
  };

  const handleMarkApplied = (insightId: string) => {
    setInsights(prev => prev.map(i =>
      i.id === insightId ? { ...i, applied: true } : i
    ));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">记忆系统</span>
          <div className="flex items-center gap-1 bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('memory')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                activeTab === 'memory' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              记忆库
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                activeTab === 'insights' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              学习洞察
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{memoryEntries.length} 条记忆</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'memory' && (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {memoryEntries.map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`p-4 bg-gray-800/50 rounded-lg cursor-pointer transition-colors ${
                      selectedEntry?.id === entry.id ? 'border-l-2 border-blue-500' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(entry.type)}`}>
                            {getTypeLabel(entry.type)}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">{entry.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {entry.metadata.source && (
                            <span className="text-xs text-gray-500">来源: {entry.metadata.source}</span>
                          )}
                          {entry.metadata.confidence && (
                            <span className="text-xs text-gray-500">置信度: {entry.metadata.confidence}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEntry(entry.id);
                        }}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {memoryEntries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-sm">暂无记忆条目</p>
                </div>
              )}
            </div>

            {selectedEntry && (
              <div className="w-80 bg-gray-800/50 border-l border-gray-700 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-300">记忆详情</h4>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">记忆类型</div>
                    <span className={`inline-block px-2 py-1 rounded-full text-sm ${getTypeColor(selectedEntry.type)}`}>
                      {getTypeLabel(selectedEntry.type)}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">创建时间</div>
                    <div className="text-sm text-gray-300">{new Date(selectedEntry.timestamp).toLocaleString('zh-CN')}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">内容</div>
                    <div className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded-lg">
                      {selectedEntry.content}
                    </div>
                  </div>

                  {Object.keys(selectedEntry.metadata).length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">元数据</div>
                      <div className="space-y-1">
                        {Object.entries(selectedEntry.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{key}</span>
                            <span className="text-gray-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleDeleteEntry(selectedEntry.id)}
                    className="w-full py-2 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    删除记忆
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'insights' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-400">学习洞察统计</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-semibold text-white">{insights.length}</div>
                    <div className="text-xs text-gray-400">总洞察数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-green-400">
                      {insights.filter(i => i.applied).length}
                    </div>
                    <div className="text-xs text-gray-400">已应用</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-yellow-400">
                      {insights.filter(i => i.confidence >= 0.9).length}
                    </div>
                    <div className="text-xs text-gray-400">高置信度</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-blue-400">
                      {insights.filter(i => !i.applied).length}
                    </div>
                    <div className="text-xs text-gray-400">待处理</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-400">智能学习</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  系统基于您的交互历史自动学习模式和偏好，生成可操作的洞察。
                </p>
                <button className="w-full py-2 bg-purple-600/20 text-purple-400 text-sm rounded-lg hover:bg-purple-600/30 transition-colors">
                  开始学习
                </button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">学习洞察列表</h3>
              <div className="space-y-3">
                {insights.map(insight => (
                  <div
                    key={insight.id}
                    className={`p-4 bg-gray-800/50 rounded-lg border ${
                      insight.applied ? 'border-green-500/30' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">任务: {insight.taskId}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            insight.confidence >= 0.9 ? 'bg-green-500/20 text-green-400' :
                            insight.confidence >= 0.7 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {Math.round(insight.confidence * 100)}% 置信度
                          </span>
                          {insight.applied && (
                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                              已应用
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{insight.insight}</p>
                        <div className="flex items-center gap-2">
                          <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="text-xs text-blue-400">{insight.action}</span>
                        </div>
                      </div>
                      {!insight.applied && (
                        <button
                          onClick={() => handleMarkApplied(insight.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-500 transition-colors"
                        >
                          应用洞察
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryPanel;