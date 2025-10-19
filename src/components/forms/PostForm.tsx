import React, { useState } from 'react';
import { Plus, Import } from 'lucide-react';
import { RunningPost } from '../../types/posts';

type PostFormProps = {
  onSubmit: (post: Omit<RunningPost, 'id'>) => void;
  onBulkClick: () => void;
  addingPost: boolean;
  addingBulk: boolean;
  bulkProgress: { current: number; total: number };
};

export function PostForm({ onSubmit, onBulkClick, addingPost, addingBulk, bulkProgress }: PostFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState<{ url?: string; title?: string }>({});

  const inputBase = 'w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent px-4 py-2.5 transition-colors';
  const labelBase = 'block text-sm font-medium text-gray-200 mb-1';
  const errorText = 'text-xs text-red-400 mt-1';

  function validate() {
    const newErrors: { url?: string; title?: string } = {};
    if (!url.trim()) newErrors.url = 'Vui lòng nhập link bài viết';
    else {
      try {
        const parsed = new URL(url.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          newErrors.url = 'Link không hợp lệ (chỉ hỗ trợ http/https)';
        }
      } catch {
        newErrors.url = 'Link không hợp lệ';
      }
    }
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tên bài viết';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    
    onSubmit({
      url: url.trim(),
      title: title.trim(),
      isVisible: true,
      commentCountToday: 0,
      lastCommentAt: null,
      status: 'Đang chạy',
    });
    
    setUrl('');
    setTitle('');
  }

  return (
    <div className="rounded-2xl p-6 bg-white/5 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-8 w-8 rounded-xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
          <Plus className="w-4.5 h-4.5 text-blue-300" />
        </div>
        <h3 className="text-lg font-semibold text-white">Tạo bài viết</h3>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className={labelBase} htmlFor="postUrl">
            Link bài viết
          </label>
          <input
            id="postUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className={inputBase}
            type="url"
            inputMode="url"
          />
          {errors.url ? <p className={errorText}>{errors.url}</p> : <p className="text-xs text-gray-400 mt-1">Nhập URL dạng https://...</p>}
        </div>
        <div className="md:col-span-1">
          <label className={labelBase} htmlFor="postTitle">
            Tên bài viết
          </label>
          <input
            id="postTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề"
            className={inputBase}
            type="text"
          />
          {errors.title ? <p className={errorText}>{errors.title}</p> : <p className="text-xs text-gray-400 mt-1">Tên hiển thị trong danh sách</p>}
        </div>
        <div className="md:col-span-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBulkClick}
            disabled={addingPost || addingBulk}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 py-2.5 transition-colors shadow-[0_8px_24px_rgba(34,197,94,0.35)] focus:outline-none focus:ring-2 focus:ring-green-500/60 focus:ring-offset-0"
          >
            {addingBulk ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang thêm {bulkProgress.current}/{bulkProgress.total}...
              </>
            ) : (
              <>
                <Import className="w-4 h-4" />
                Thêm hàng loạt
              </>
            )}
          </button>
          <button
            type="submit"
            disabled={addingPost || addingBulk}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 py-2.5 transition-colors shadow-[0_8px_24px_rgba(79,70,229,0.35)] focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-0"
          >
            {addingPost ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang thêm...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Thêm bài viết
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
