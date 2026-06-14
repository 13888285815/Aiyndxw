export interface FileContent {
  fileName: string;
  fileType: string;
  content: string;
  metadata: {
    size: number;
    lastModified: Date;
    pages?: number;
    sheets?: string[];
  };
}

export interface FileAnalysis {
  summary: string;
  keyPoints: string[];
  tables?: any[];
  charts?: any[];
}

const SUPPORTED_FORMATS = [
  'text/plain',
  'application/json',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/html',
  'application/xml',
  'application/javascript',
  'text/typescript',
  'application/python',
  'text/markdown',
];

export const fileTypeIcons: Record<string, string> = {
  'text/plain': '📄',
  'application/json': '📋',
  'text/csv': '📊',
  'application/vnd.ms-excel': '📈',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📈',
  'application/pdf': '📕',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-powerpoint': '📊',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
  'text/html': '🌐',
  'application/xml': '📰',
  'application/javascript': '💻',
  'text/typescript': '💻',
  'application/python': '🐍',
  'text/markdown': '📝',
};

export const fileTypeLabels: Record<string, string> = {
  'text/plain': '文本文件',
  'application/json': 'JSON文件',
  'text/csv': 'CSV表格',
  'application/vnd.ms-excel': 'Excel文件',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel文件',
  'application/pdf': 'PDF文件',
  'application/msword': 'Word文档',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
  'application/vnd.ms-powerpoint': 'PPT演示',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPT演示',
  'text/html': 'HTML页面',
  'application/xml': 'XML文件',
  'application/javascript': 'JavaScript',
  'text/typescript': 'TypeScript',
  'application/python': 'Python脚本',
  'text/markdown': 'Markdown',
};

export function isSupportedFormat(mimeType: string): boolean {
  return SUPPORTED_FORMATS.includes(mimeType);
}

export async function readTextFile(file: File): Promise<FileContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        fileName: file.name,
        fileType: file.type,
        content: e.target?.result as string,
        metadata: {
          size: file.size,
          lastModified: new Date(file.lastModified),
        },
      });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function readBinaryFile(file: File): Promise<FileContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      resolve({
        fileName: file.name,
        fileType: file.type,
        content: base64,
        metadata: {
          size: file.size,
          lastModified: new Date(file.lastModified),
        },
      });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function readFile(file: File): Promise<FileContent> {
  if (file.type.startsWith('text/') || file.type === 'application/json') {
    return readTextFile(file);
  }
  return readBinaryFile(file);
}

export async function analyzeFile(fileContent: FileContent): Promise<FileAnalysis> {
  const analysis: FileAnalysis = {
    summary: '',
    keyPoints: [],
  };

  if (fileContent.fileType === 'text/csv' || 
      fileContent.fileType.includes('spreadsheet')) {
    analysis.summary = analyzeSpreadsheet(fileContent);
    analysis.keyPoints = extractSpreadsheetKeyPoints(fileContent);
  } else if (fileContent.fileType === 'application/json') {
    analysis.summary = analyzeJson(fileContent);
    analysis.keyPoints = extractJsonKeyPoints(fileContent);
  } else if (fileContent.fileType.startsWith('text/')) {
    analysis.summary = analyzeText(fileContent);
    analysis.keyPoints = extractTextKeyPoints(fileContent);
  } else {
    analysis.summary = `文件类型: ${fileTypeLabels[fileContent.fileType] || fileContent.fileType}\n文件大小: ${formatFileSize(fileContent.metadata.size)}\n修改时间: ${fileContent.metadata.lastModified.toLocaleString()}`;
    analysis.keyPoints = [
      `文件名: ${fileContent.fileName}`,
      `文件类型: ${fileTypeLabels[fileContent.fileType] || '未知'}`,
      `文件大小: ${formatFileSize(fileContent.metadata.size)}`,
    ];
  }

  return analysis;
}

function analyzeSpreadsheet(fileContent: FileContent): string {
  const lines = fileContent.content.split('\n').filter(line => line.trim());
  const header = lines[0]?.split(',') || [];
  const rowCount = lines.length - 1;
  
  return `📊 电子表格分析\n\n**基本信息**\n- 总行数: ${rowCount} 行数据\n- 列数: ${header.length} 列\n- 列名: ${header.join(', ')}\n\n**数据概览**\n该表格包含 ${rowCount} 条记录，涵盖 ${header.length} 个字段。`;
}

function extractSpreadsheetKeyPoints(fileContent: FileContent): string[] {
  const lines = fileContent.content.split('\n').filter(line => line.trim());
  const header = lines[0]?.split(',') || [];
  const rowCount = lines.length - 1;
  
  return [
    `包含 ${rowCount} 行数据`,
    `包含 ${header.length} 列: ${header.slice(0, 5).join(', ')}${header.length > 5 ? '...' : ''}`,
    `文件大小: ${formatFileSize(fileContent.metadata.size)}`,
  ];
}

function analyzeJson(fileContent: FileContent): string {
  try {
    const data = JSON.parse(fileContent.content);
    const keys = Object.keys(data);
    
    return `📋 JSON文件分析\n\n**基本信息**\n- 类型: ${Array.isArray(data) ? '数组' : '对象'}\n- 字段数: ${keys.length}\n- 字段名: ${keys.join(', ')}\n\n**数据结构**\n${Array.isArray(data) ? `包含 ${data.length} 个元素` : `包含 ${keys.length} 个属性`}`;
  } catch {
    return `⚠️ JSON解析失败，内容可能不是有效的JSON格式。`;
  }
}

function extractJsonKeyPoints(fileContent: FileContent): string[] {
  try {
    const data = JSON.parse(fileContent.content);
    const keys = Object.keys(data);
    
    return [
      `数据类型: ${Array.isArray(data) ? '数组' : '对象'}`,
      `字段/元素数: ${Array.isArray(data) ? data.length : keys.length}`,
      `文件大小: ${formatFileSize(fileContent.metadata.size)}`,
    ];
  } catch {
    return ['JSON格式无效'];
  }
}

function analyzeText(fileContent: FileContent): string {
  const chars = fileContent.content.length;
  const words = fileContent.content.split(/\s+/).length;
  const lines = fileContent.content.split('\n').length;
  
  return `📝 文本文件分析\n\n**基本信息**\n- 字符数: ${chars.toLocaleString()}\n- 单词数: ${words.toLocaleString()}\n- 行数: ${lines}\n\n**内容预览**\n${fileContent.content.slice(0, 500)}${fileContent.content.length > 500 ? '...' : ''}`;
}

function extractTextKeyPoints(fileContent: FileContent): string[] {
  const chars = fileContent.content.length;
  const words = fileContent.content.split(/\s+/).length;
  
  return [
    `字符数: ${chars.toLocaleString()}`,
    `单词数: ${words.toLocaleString()}`,
    `文件大小: ${formatFileSize(fileContent.metadata.size)}`,
  ];
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function readFilesFromDirectory(directoryPath: string): Promise<FileContent[]> {
  const mockFiles: FileContent[] = [
    {
      fileName: '项目预算表.xlsx',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      content: '',
      metadata: { size: 102400, lastModified: new Date('2024-01-15'), sheets: ['预算汇总', '明细', '图表'] },
    },
    {
      fileName: '会议记录.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      content: '',
      metadata: { size: 51200, lastModified: new Date('2024-01-14') },
    },
    {
      fileName: '产品说明.pdf',
      fileType: 'application/pdf',
      content: '',
      metadata: { size: 512000, lastModified: new Date('2024-01-13'), pages: 24 },
    },
    {
      fileName: '销售数据.csv',
      fileType: 'text/csv',
      content: '',
      metadata: { size: 25600, lastModified: new Date('2024-01-12') },
    },
    {
      fileName: '季度报告.pptx',
      fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      content: '',
      metadata: { size: 1024000, lastModified: new Date('2024-01-11') },
    },
  ];
  
  return Promise.resolve(mockFiles);
}