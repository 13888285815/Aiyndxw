import React, { useState, useRef } from 'react';
import { FileItem } from '../types';
import { mockFiles } from '../data/mockData';

interface ExtendedFileItem extends FileItem {
  isImage?: boolean;
  imageUrl?: string;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<ExtendedFileItem[]>([
    ...mockFiles,
    {
      id: 'sample-image-1',
      name: '风景照片.jpg',
      type: 'file',
      size: 204800,
      modifiedAt: new Date('2024-01-14'),
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      isImage: true,
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    },
    {
      id: 'sample-image-2',
      name: '工作截图.png',
      type: 'file',
      size: 153600,
      modifiedAt: new Date('2024-01-15'),
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      isImage: true,
      imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop',
    },
  ]);
  const [selectedFile, setSelectedFile] = useState<ExtendedFileItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFileOpen = async (file: FileItem) => {
    setIsLoading(true);
    setSelectedFile(file);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockContents: Record<string, string> = {
      'README.md': `# 项目说明文档\n\n## 项目概述\n\n这是一个基于 React + TypeScript 的智能助手项目，集成了 OpenMythos 深度推理引擎。\n\n## 功能特性\n\n- 🤖 多模态交互\n- 🔮 循环深度Transformer\n- 🧠 沉默思考机制\n- 💾 多层次记忆系统\n\n## 快速开始\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``,
      '项目计划.xlsx': `项目计划表格内容\n\n| 任务名称 | 状态 | 优先级 |\n|---------|------|--------|\n| 完成用户认证 | 进行中 | 高 |\n| 设计数据库架构 | 进行中 | 高 |\n| 编写API文档 | 进行中 | 中 |\n| 优化首页性能 | 待开始 | 中 |\n\n## 项目里程碑\n\n- 第一阶段：基础功能开发\n- 第二阶段：智能体集成\n- 第三阶段：模型优化`,
      '设计规范.pdf': `设计规范文档内容\n\n## 设计原则\n\n1. 一致性原则\n2. 清晰性原则\n3. 可用性原则\n\n## 颜色规范\n\n- 主色调：蓝色系\n- 背景色：深色主题\n- 强调色：紫色系\n\n## 字体规范\n\n- 标题：18px\n- 正文：14px\n- 辅助文字：12px`,
      '会议记录.docx': `会议记录\n\n日期：2024年1月15日\n\n## 参会人员\n\n- 张三 - 项目经理\n- 李四 - 开发工程师\n- 王五 - 设计师\n\n## 会议内容\n\n1. 讨论了项目进度\n2. 确定了技术方案\n3. 分配了开发任务\n\n## 行动项\n\n- [ ] 完成数据库设计\n- [ ] 编写API文档\n- [ ] 实现用户认证`,
    };
    
    setFileContent(mockContents[file.name] || `## ${file.name}\n\n文件内容预览功能已启用。\n\n这是文件 "${file.name}" 的内容预览。\n\n文件大小：${formatFileSize(file.size)}\n修改时间：${new Date(file.modifiedAt).toLocaleString('zh-CN')}`);
    setIsLoading(false);
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      const newFiles: ExtendedFileItem[] = Array.from(uploadedFiles).map((file, index) => {
        const isImage = file.type.startsWith('image/');
        return {
          id: `upload-${Date.now()}-${index}`,
          name: file.name,
          type: 'file' as const,
          size: file.size,
          modifiedAt: new Date(),
          icon: isImage 
            ? 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            : 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
          isImage,
          imageUrl: isImage ? URL.createObjectURL(file) : undefined,
        };
      });
      setFiles(prev => [...newFiles, ...prev]);
    }
  };

  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: false,
      });
      
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(videoTrack);
      const bitmap = await imageCapture.grabFrame();
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(bitmap, 0, 0);
      
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve, 'image/png'));
      const imageUrl = URL.createObjectURL(blob);
      
      const screenshotFile: ExtendedFileItem = {
        id: `screenshot-${Date.now()}`,
        name: `截图_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.png`,
        type: 'file',
        size: blob.size,
        modifiedAt: new Date(),
        icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
        isImage: true,
        imageUrl,
      };
      
      setFiles(prev => [screenshotFile, ...prev]);
      setSelectedFile(screenshotFile);
      setPreviewImage(imageUrl);
      
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('截图失败:', error);
      alert('截图功能不可用，请确保已授权屏幕录制权限');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      handleFileChange({ target: { files: droppedFiles } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDelete = (fileId: string) => {
    if (confirm('确定要删除这个文件吗？')) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
        setFileContent(null);
      }
    }
  };

  const handleDownload = (file: ExtendedFileItem) => {
    if (file.isImage && file.imageUrl) {
      const link = document.createElement('a');
      link.href = file.imageUrl;
      link.download = file.name;
      link.click();
    } else {
      const content = `文件: ${file.name}\n大小: ${formatFileSize(file.size)}\n修改时间: ${new Date(file.modifiedAt).toLocaleString('zh-CN')}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleRename = (file: ExtendedFileItem) => {
    setSelectedFile(file);
    setRenameValue(file.name);
    setShowRenameModal(true);
  };

  const confirmRename = () => {
    if (selectedFile && renameValue.trim()) {
      setFiles(prev => prev.map(f =>
        f.id === selectedFile.id ? { ...f, name: renameValue.trim() } : f
      ));
      setSelectedFile(prev => prev ? { ...prev, name: renameValue.trim() } : null);
      setShowRenameModal(false);
    }
  };

  const renderIcon = (iconPath: string) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
    </svg>
  );

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">文件管理</h2>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={handleUpload}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              上传文件
            </button>
            <button
              onClick={handleScreenshot}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              截图
            </button>
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex-1 overflow-y-auto p-4 border-2 border-dashed border-gray-700/50 rounded-lg hover:border-blue-500/50 transition-colors min-h-[400px]"
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map(file => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  onDoubleClick={() => file.type === 'file' && handleFileOpen(file)}
                  className={`p-4 bg-gray-800/50 rounded-lg cursor-pointer transition-all hover:bg-gray-800 ${file.type === 'folder' ? 'hover:bg-blue-500/20' : 'hover:bg-green-500/20'}`}
                  title={file.type === 'file' ? '双击打开文件' : '点击查看详情'}
                >
                  <div className={`flex justify-center mb-3 ${file.type === 'folder' ? 'text-blue-400' : 'text-gray-400'}`}>
                    {renderIcon(file.icon)}
                  </div>
                  <div className="text-sm text-gray-200 truncate text-center">{file.name}</div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {file.type === 'folder' ? '文件夹' : formatFileSize(file.size)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {files.map(file => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  onDoubleClick={() => file.type === 'file' && handleFileOpen(file)}
                  className={`flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg cursor-pointer transition-all hover:bg-gray-800 ${file.type === 'file' ? 'hover:bg-green-500/20' : ''}`}
                  title={file.type === 'file' ? '双击打开文件' : '点击查看详情'}
                >
                  <div className={`${file.type === 'folder' ? 'text-blue-400' : 'text-gray-400'}`}>
                    {renderIcon(file.icon)}
                  </div>
                  <div className="flex-1 text-sm text-gray-200">{file.name}</div>
                  <div className="text-xs text-gray-500 w-24 text-right">
                    {file.type === 'folder' ? '-' : formatFileSize(file.size)}
                  </div>
                  <div className="text-xs text-gray-500 w-32 text-right">
                    {formatDate(file.modifiedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="w-96 bg-gray-800/50 border-l border-gray-700 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-white">文件详情</h3>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFileContent(null);
              }}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {previewImage ? (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  图片预览
                </span>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  返回详情
                </button>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src={previewImage}
                  alt="预览图片"
                  className="max-w-full max-h-[400px] object-contain rounded-lg border border-gray-700"
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewImage;
                      link.download = selectedFile?.name || 'image.png';
                      link.click();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    下载图片
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': fetch(previewImage).then(res => res.blob()) })
                      ]).then(() => {
                        alert('图片已复制到剪贴板');
                      }).catch(err => {
                        console.error('复制失败:', err);
                      });
                    }}
                    className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    复制图片
                  </button>
                </div>
              </div>
            </div>
          ) : fileContent ? (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  文件已打开
                </span>
                <button
                  onClick={() => setFileContent(null)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  返回详情
                </button>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    {fileContent}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`p-4 rounded-lg ${selectedFile.type === 'folder' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                    {renderIcon(selectedFile.icon)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">文件名</div>
                  <div className="text-sm text-white">{selectedFile.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">类型</div>
                    <div className="text-sm text-gray-400">{selectedFile.type === 'folder' ? '文件夹' : '文件'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">大小</div>
                    <div className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">修改时间</div>
                  <div className="text-sm text-gray-400">{new Date(selectedFile.modifiedAt).toLocaleString('zh-CN')}</div>
                </div>

                <div className="pt-4 border-t border-gray-700 space-y-2">
                  {selectedFile.type === 'file' && (
                    <button
                      onClick={() => {
                        if (selectedFile.isImage && selectedFile.imageUrl) {
                          setPreviewImage(selectedFile.imageUrl);
                        } else {
                          handleFileOpen(selectedFile);
                        }
                      }}
                      className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {selectedFile.isImage ? '预览图片' : '打开文件'}
                    </button>
                  )}
                  <button
                    onClick={() => selectedFile && handleDownload(selectedFile)}
                    className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载
                  </button>
                  <button
                    onClick={() => selectedFile && handleRename(selectedFile)}
                    className="w-full py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    重命名
                  </button>
                  <button
                    onClick={() => handleDelete(selectedFile.id)}
                    className="w-full py-2 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    删除
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRenameModal(false)}>
          <div className="bg-gray-800 rounded-xl w-[400px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">重命名文件</h2>
              <button onClick={() => setShowRenameModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">新文件名</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmRename}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;