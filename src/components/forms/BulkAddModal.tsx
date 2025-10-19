import React, { useState } from 'react';
import { X } from 'lucide-react';

type BulkAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (posts: Array<{ url: string; title: string }>) => void;
};

export function BulkAddModal({ isOpen, onClose, onSubmit }: BulkAddModalProps) {
  const [bulkText, setBulkText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  function handleSubmit() {
    const lines = bulkText.trim().split('\n').filter(line => line.trim());
    const newErrors: string[] = [];
    const newPosts: Array<{ url: string; title: string }> = [];

    lines.forEach((line, index) => {
      const parts = line.split('|');
      if (parts.length !== 2) {
        newErrors.push(`Dòng ${index + 1}: Format không đúng. Cần "link|tiêu đề"`);
        return;
      }

      const [url, title] = parts.map(part => part.trim());
      
      if (!url) {
        newErrors.push(`Dòng ${index + 1}: Link không được để trống`);
        return;
      }
      
      if (!title) {
        newErrors.push(`Dòng ${index + 1}: Tiêu đề không được để trống`);
        return;
      }

      // Validate URL
      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          newErrors.push(`Dòng ${index + 1}: Link không hợp lệ (chỉ hỗ trợ http/https)`);
          return;
        }
      } catch {
        newErrors.push(`Dòng ${index + 1}: Link không hợp lệ`);
        return;
      }

      newPosts.push({ url, title });
    });

    setErrors(newErrors);
    
    if (newErrors.length === 0) {
      onSubmit(newPosts);
      setBulkText('');
      onClose();
    }
  }

  function handleClose() {
    setBulkText('');
    setErrors([]);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full border border-gray-600/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Thêm hàng loạt</h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Nhập danh sách (mỗi dòng một bài viết)
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Format: <code className="bg-gray-700/50 px-2 py-1 rounded text-green-300">link|tiêu đề</code>
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="https://example.com/post1|Tiêu đề bài viết 1&#10;https://example.com/post2|Tiêu đề bài viết 2&#10;https://example.com/post3|Tiêu đề bài viết 3"
            className="w-full h-40 px-3 py-3 rounded-xl bg-gray-800/90 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/60 focus:border-green-500/50 transition-all resize-none font-mono text-sm"
          />
        </div>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-500/40 rounded-lg backdrop-blur-sm">
            <h4 className="text-sm font-medium text-red-300 mb-2">Lỗi:</h4>
            <ul className="text-xs text-red-400 space-y-1 max-h-32 overflow-y-auto">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-colors border border-gray-600/30"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl transition-colors shadow-[0_4px_16px_rgba(34,197,94,0.35)]"
          >
            Thêm {bulkText.trim().split('\n').filter(line => line.trim()).length} bài viết
          </button>
        </div>
      </div>
    </div>
  );
}
