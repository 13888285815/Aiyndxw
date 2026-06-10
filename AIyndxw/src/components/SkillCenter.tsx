import React, { useState } from 'react';
import { mockSkills as initialSkills, mockAutoSkills } from '../data/mockData';

interface SkillCenterProps {
  skillId: string;
}

const SkillCenter: React.FC<SkillCenterProps> = ({ skillId }) => {
  const [activeTab, setActiveTab] = useState(skillId === 'skill-my-skills' ? 'my-skills' : 'store');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [skills, setSkills] = useState(initialSkills);
  const [installingSkill, setInstallingSkill] = useState<string | null>(null);
  const [trainingSkill, setTrainingSkill] = useState(false);
  const [autoSkills, setAutoSkills] = useState(mockAutoSkills);
  const [editingAutoSkill, setEditingAutoSkill] = useState<typeof mockAutoSkills[0] | null>(null);
  const [showAutoSkillModal, setShowAutoSkillModal] = useState(false);

  const installedSkills = skills.filter((s) => s.installed);
  const availableSkills = skills.filter((s) => !s.installed);

  const handleInstall = (skillId: string) => {
    setInstallingSkill(skillId);
    setTimeout(() => {
      setSkills(prev => prev.map(s =>
        s.id === skillId ? { ...s, installed: true } : s
      ));
      setInstallingSkill(null);
    }, 1500);
  };

  const handleUninstall = (skillId: string) => {
    if (confirm('确定要卸载这个技能吗？')) {
      setSkills(prev => prev.map(s =>
        s.id === skillId ? { ...s, installed: false } : s
      ));
    }
  };

  const handleTrainSkill = () => {
    setTrainingSkill(true);
    setTimeout(() => {
      setTrainingSkill(false);
      alert('技能训练完成！新技能已生成。');
    }, 3000);
  };

  const handleDeleteAutoSkill = (skillId: string) => {
    if (confirm('确定要删除这个自动技能吗？')) {
      setAutoSkills(prev => prev.filter(s => s.id !== skillId));
    }
  };

  const handleEditAutoSkill = (skill: typeof mockAutoSkills[0]) => {
    setEditingAutoSkill(skill);
    setShowAutoSkillModal(true);
  };

  const handleSaveAutoSkill = () => {
    if (editingAutoSkill) {
      setAutoSkills(prev => prev.map(s =>
        s.id === editingAutoSkill.id ? editingAutoSkill : s
      ));
      setShowAutoSkillModal(false);
      setEditingAutoSkill(null);
    }
  };

  const handleUpdateAutoSkill = (field: string, value: any) => {
    if (editingAutoSkill) {
      setEditingAutoSkill({ ...editingAutoSkill, [field]: value });
    }
  };

  if (selectedSkill) {
    const skill = skills.find((s) => s.id === selectedSkill);
    if (skill) {
      return (
        <div className="h-full p-6 overflow-y-auto">
          <button
            onClick={() => setSelectedSkill(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回技能列表
          </button>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={skill.icon} />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{skill.name}</h2>
                <span className="text-sm text-gray-400">{skill.category}</span>
              </div>
            </div>

            <p className="text-gray-300 mb-6">{skill.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-sm text-gray-400">使用次数</div>
                <div className="text-lg font-semibold text-white">{skill.usageCount}</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-sm text-gray-400">上次使用</div>
                <div className="text-lg font-semibold text-white">
                  {skill.lastUsed ? new Date(skill.lastUsed).toLocaleDateString() : '从未'}
                </div>
              </div>
            </div>

            <button
              className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                skill.installed
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
              onClick={() => {
                if (skill.installed) {
                  handleUninstall(skill.id);
                } else {
                  handleInstall(skill.id);
                }
              }}
              disabled={installingSkill === skill.id}
            >
              {skill.installed ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  卸载技能
                </>
              ) : installingSkill === skill.id ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  安装中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  安装技能
                </>
              )}
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">技能中心</h2>
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'store' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            技能商店
          </button>
          <button
            onClick={() => setActiveTab('my-skills')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my-skills' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            我的技能 ({installedSkills.length})
          </button>
          <button
            onClick={() => setActiveTab('auto')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'auto' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            自动技能 ({autoSkills.length})
          </button>
        </div>
      </div>

      {activeTab === 'store' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableSkills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => setSelectedSkill(skill.id)}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={skill.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">{skill.name}</h3>
                  <span className="text-xs text-gray-500">{skill.category}</span>
                </div>
              </div>
              <p className="text-sm text-gray-400">{skill.description}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'my-skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {installedSkills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => setSelectedSkill(skill.id)}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={skill.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">{skill.name}</h3>
                  <span className="text-xs text-green-400">已安装</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-3">{skill.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>使用 {skill.usageCount} 次</span>
                <span>
                  {skill.lastUsed ? `上次: ${new Date(skill.lastUsed).toLocaleDateString()}` : '从未使用'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'auto' && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium text-blue-400">自动技能说明</span>
            </div>
            <p className="text-sm text-gray-400">
              自动技能是系统从您的任务执行中自动学习并生成的。系统会分析您的成功案例，识别可复用模式，并自动创建技能。
            </p>
          </div>

          {autoSkills.map((skill) => (
            <div key={skill.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-white">{skill.name}</h3>
                  <span className="text-xs text-gray-500">置信度: {Math.round(skill.confidence * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                    已优化 {skill.refinedCount} 次
                  </span>
                  <button
                    onClick={() => handleEditAutoSkill(skill)}
                    className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="编辑"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteAutoSkill(skill.id)}
                    className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-3">{skill.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">触发条件:</span>
                  <span className="text-gray-300">{skill.triggerPattern}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">执行动作:</span>
                  <div className="flex flex-wrap gap-1">
                    {skill.actions.map((action, index) => (
                      <span key={index} className="text-xs px-2 py-0.5 bg-gray-700 rounded">{action}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleTrainSkill}
            disabled={trainingSkill}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              {trainingSkill ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {trainingSkill ? '训练中...' : '训练新技能'}
            </span>
          </button>
        </div>
      )}

      {showAutoSkillModal && editingAutoSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAutoSkillModal(false)}>
          <div className="bg-gray-800 rounded-xl w-[500px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h2 className="font-semibold text-white">编辑自动技能</h2>
              <button onClick={() => setShowAutoSkillModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">技能名称</label>
                  <input
                    type="text"
                    value={editingAutoSkill.name}
                    onChange={(e) => handleUpdateAutoSkill('name', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">描述</label>
                  <textarea
                    value={editingAutoSkill.description}
                    onChange={(e) => handleUpdateAutoSkill('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">触发条件</label>
                  <input
                    type="text"
                    value={editingAutoSkill.triggerPattern}
                    onChange={(e) => handleUpdateAutoSkill('triggerPattern', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">置信度 ({Math.round(editingAutoSkill.confidence * 100)}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={editingAutoSkill.confidence}
                    onChange={(e) => handleUpdateAutoSkill('confidence', Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">优化次数</label>
                  <input
                    type="number"
                    value={editingAutoSkill.refinedCount}
                    onChange={(e) => handleUpdateAutoSkill('refinedCount', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAutoSkillModal(false)}
                    className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveAutoSkill}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    保存更改
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillCenter;