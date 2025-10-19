import { Search, Trash2 } from 'lucide-react';

type FilterControlsProps = {
  searchTitle: string;
  onSearchTitleChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  onClearFilters: () => void;
  onDeleteSelected: () => void;
  selectedCount: number;
};

export function FilterControls({
  searchTitle,
  onSearchTitleChange,
  filterStatus,
  onFilterStatusChange,
  onClearFilters,
  onDeleteSelected,
  selectedCount,
}: FilterControlsProps) {
  return (
    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-200 mb-2">Tìm kiếm tiêu đề</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => onSearchTitleChange(e.target.value)}
              placeholder="Nhập tiêu đề..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-800/80 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-200 mb-2">Trạng thái</label>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-gray-800/80 border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50 transition-all appearance-none"
            >
              <option value="all" className="bg-gray-800 text-white">Tất cả</option>
              <option value="Đang chạy" className="bg-gray-800 text-white">Đang chạy</option>
              <option value="Tạm dừng" className="bg-gray-800 text-white">Tạm dừng</option>
              <option value="Lỗi" className="bg-gray-800 text-white">Lỗi</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-3">
          <button
            onClick={onClearFilters}
            className="px-4 py-2.5 text-sm text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all"
          >
            Xóa bộ lọc
          </button>
          {selectedCount > 0 && (
            <button
              onClick={onDeleteSelected}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-red-600 hover:bg-red-500 rounded-xl border border-red-500/30 hover:border-red-400/50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Xóa {selectedCount} bài viết
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
