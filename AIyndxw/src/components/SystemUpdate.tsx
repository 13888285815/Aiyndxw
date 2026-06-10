import React, { useState, useEffect } from 'react';

const SystemUpdate: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('2.0.1');
  const [latestVersion, setLatestVersion] = useState('2.0.1');
  const [updateStatus, setUpdateStatus] = useState<'up-to-date' | 'available' | 'error'>('up-to-date');

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    setIsChecking(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLatestVersion('2.1.0');
    setUpdateStatus('available');
    setIsChecking(false);
  };

  const performUpdate = async () => {
    setIsChecking(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCurrentVersion(latestVersion);
    setUpdateStatus('up-to-date');
    setIsChecking(false);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">系统更新</h2>
        <button
          onClick={checkForUpdates}
          disabled={isChecking}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isChecking ? '检查中...' : '检查更新'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-200">意念AI</div>
              <div className="text-xs text-gray-500">智能助手平台</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">当前版本</div>
              <div className="text-sm text-white font-medium">{currentVersion}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">最新版本</div>
              <div className="text-sm font-medium">
                {isChecking ? (
                  <span className="text-gray-400">检查中...</span>
                ) : (
                  <span className={updateStatus === 'available' ? 'text-green-400' : 'text-gray-300'}>
                    {latestVersion}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {updateStatus === 'available' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-green-400 mb-1">更新可用</div>
                <div className="text-xs text-gray-400">新版本 {latestVersion} 已发布，包含性能改进和新功能</div>
              </div>
            </div>
            <button
              onClick={performUpdate}
              disabled={isChecking}
              className="mt-4 w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
            >
              {isChecking ? '更新中...' : '立即更新'}
            </button>
          </div>
        )}

        {updateStatus === 'up-to-date' && !isChecking && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-300">系统已更新</div>
                <div className="text-xs text-gray-500">当前版本是最新版本</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="text-sm font-medium text-gray-300 mb-3">更新日志</div>
          <div className="space-y-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">版本 2.1.0</span>
                <span className="text-xs text-gray-500">2024-01-15</span>
              </div>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  优化智能助手响应速度
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  新增技能商店功能
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  修复已知Bug
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">版本 2.0.1</span>
                <span className="text-xs text-gray-500">2024-01-10</span>
              </div>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  支持本地/云端模型切换
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  新增指令系统
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  优化界面布局
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemUpdate;