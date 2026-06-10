export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ThinkingStep {
  step: string;
  content: string;
}

export interface CommandHistory {
  command: string;
  timestamp: Date;
  success: boolean;
  category: string;
}

export interface QuickCommand {
  label: string;
  command: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'busy';
  icon: string;
  role: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  installed: boolean;
  icon: string;
  usageCount: number;
  lastUsed: Date | null;
}

export interface AutoSkill {
  id: string;
  name: string;
  description: string;
  triggerPattern: string;
  actions: string[];
  confidence: number;
  createdFromTask: string;
  createdAt: Date;
  refinedCount: number;
}

export interface MemoryEntry {
  id: string;
  type: 'session' | 'persistent' | 'skill';
  content: string;
  timestamp: Date;
  metadata: Record<string, string>;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  cost: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'medium' | 'complex';
  available: boolean;
}

export interface SystemSetting {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  schedule: string;
  lastRun: Date | null;
  nextRun: Date;
  enabled: boolean;
  status: 'success' | 'failed' | 'pending';
  action: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  modifiedAt: Date;
  icon: string;
}

export interface LearningInsight {
  id: string;
  taskId: string;
  insight: string;
  action: string;
  confidence: number;
  applied: boolean;
  timestamp: Date;
}