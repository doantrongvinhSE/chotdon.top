import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10">
      <div className="text-sm text-gray-400">
        Hiển thị {startItem}-{endItem} trong tổng số {totalItems} bài viết
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Trước
        </button>
        
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sau
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
