import React, { useState } from 'react';
import { mockModels } from '../data/mockData';

interface SystemSettingsProps {
  activeTab?: string;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ activeTab: initialTab }) => {
  const [activeTab, setActiveTab] = useState(
    initialTab === 'setting-connection' ? 'connection' : 
    initialTab === 'setting-model' ? 'model' : 'connection'
  );
  
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [autoConnect, setAutoConnect] = useState(true);
  const [selectedModel, setSelectedModel] = useState('model-1');
  const [contextWindow, setContextWindow] = useState(8192);
  const [temperature, setTemperature] = useState(0.7);
  const [autoModelSelect, setAutoModelSelect] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleConnect = () => {
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">系统设置</h2>
        <button
          onClick={handleSaveSettings}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
        >
          {saveStatus === 'saving' ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              保存中...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已保存
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              保存更改
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('connection')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'connection' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          连接设置
        </button>
        <button
          onClick={() => setActiveTab('model')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'model' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          模型管理
        </button>
      </div>

      {activeTab === 'connection' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-white mb-1">连接状态</h3>
                <p className="text-sm text-gray-400">管理与云端服务的连接</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-gray-500'
                }`}></span>
                {connectionStatus === 'connected' ? '已连接' :
                 connectionStatus === 'connecting' ? '连接中...' : '已断开'}
              </div>
            </div>

            <div className="flex gap-3">
              {connectionStatus !== 'connected' ? (
                <button
                  onClick={handleConnect}
                  disabled={connectionStatus === 'connecting'}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                >
                  连接
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-colors"
                >
                  断开连接
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">连接模式</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value="auto"
                  checked={selectedProvider === 'auto'}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="text-sm text-white">自动选择</div>
                  <div className="text-xs text-gray-400">系统自动选择最佳连接方式</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value="cloud"
                  checked={selectedProvider === 'cloud'}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="text-sm text-white">云端连接</div>
                  <div className="text-xs text-gray-400">连接到云端服务</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value="local"
                  checked={selectedProvider === 'local'}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="text-sm text-white">本地连接</div>
                  <div className="text-xs text-gray-400">使用本地模型</div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">代理设置</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">启用代理</div>
                  <div className="text-xs text-gray-400">通过代理服务器连接</div>
                </div>
                <button
                  onClick={() => setProxyEnabled(!proxyEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${proxyEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${proxyEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></span>
                </button>
              </div>

              {proxyEnabled && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">代理地址</label>
                  <input
                    type="text"
                    value={proxyUrl}
                    onChange={(e) => setProxyUrl(e.target.value)}
                    placeholder="http://proxy.example.com:8080"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white">自动连接</div>
                <div className="text-xs text-gray-400">启动时自动连接到服务</div>
              </div>
              <button
                onClick={() => setAutoConnect(!autoConnect)}
                className={`w-12 h-6 rounded-full transition-colors ${autoConnect ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${autoConnect ? 'translate-x-6' : 'translate-x-0.5'}`}></span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'model' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">当前模型</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-medium text-white">{mockModels[0].name}</div>
                <div className="text-sm text-gray-400">{mockModels[0].provider}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">可用模型</h3>
            <div className="space-y-3">
              {mockModels.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors border ${
                    selectedModel === model.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{model.name}</span>
                      {model.available && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                          可用
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{model.provider}</span>
                      <span className={`px-2 py-0.5 rounded ${
                        model.cost === 'low' ? 'bg-green-500/20 text-green-400' :
                        model.cost === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {model.cost === 'low' ? '低成本' : model.cost === 'medium' ? '中成本' : '高成本'}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">模型设置</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">上下文窗口大小</label>
                <input
                  type="range"
                  min="1024"
                  max="16384"
                  value={contextWindow}
                  onChange={(e) => setContextWindow(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1K</span>
                  <span>{contextWindow}K (当前)</span>
                  <span>16K</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">温度</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 (精确)</span>
                  <span>{temperature} (当前)</span>
                  <span>2 (创意)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-blue-400">智能模型选择</div>
                  <div className="text-xs text-gray-400">启用后，系统将根据任务复杂度自动选择最优模型</div>
                </div>
              </div>
              <button
                onClick={() => setAutoModelSelect(!autoModelSelect)}
                className={`w-12 h-6 rounded-full transition-colors ${autoModelSelect ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${autoModelSelect ? 'translate-x-6' : 'translate-x-0.5'}`}></span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;