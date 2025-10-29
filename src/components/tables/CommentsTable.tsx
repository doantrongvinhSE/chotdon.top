import React, { useState } from 'react';
import { Comment, CommentStatus } from '../../types/posts';
import StatusDropdown from '../ui/StatusDropdown';
import { Pagination } from '../ui/Pagination';
import { Copy, Check, ShoppingCart } from 'lucide-react';

interface CommentsTableProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onStatusChange: (commentId: string, status: CommentStatus) => void;
  onPageChange: (page: number) => void;
  onCreateOrder?: (comment: Comment) => void;
  compact?: boolean;
  onShowToast?: (message: string) => void;
}

const CommentsTable: React.FC<CommentsTableProps> = ({
  comments,
  loading,
  error,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onStatusChange,
  onPageChange,
  onCreateOrder,
  compact = false,
  onShowToast,
}) => {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [copiedPost, setCopiedPost] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const thPad = compact ? 'px-2 py-1.5' : 'px-4 py-3';
  const tdPad = compact ? 'px-2 py-1.5' : 'px-4 py-4';

  const abbreviate = (text: string, maxLength = 20) => {
    if (!text) return '';
    const actualMaxLength = compact ? Math.min(maxLength, 15) : maxLength;
    return text.length > actualMaxLength ? `${text.slice(0, actualMaxLength)}...` : text;
  };

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 2000);
      if (onShowToast) {
        onShowToast(`Đã copy số điện thoại: ${phone}`);
      }
    } catch (err) {
      console.error('Failed to copy phone:', err);
      if (onShowToast) {
        onShowToast('Không thể copy số điện thoại');
      }
    }
  };

  const copyPost = async (postName: string) => {
    try {
      await navigator.clipboard.writeText(postName);
      setCopiedPost(postName);
      setTimeout(() => setCopiedPost(null), 2000);
    } catch (err) {
      console.error('Failed to copy post:', err);
    }
  };

  const copyUid = async (uid: string) => {
    try {
      await navigator.clipboard.writeText(uid);
      setCopiedUid(uid);
      setTimeout(() => setCopiedUid(null), 2000);
    } catch (err) {
      console.error('Failed to copy UID:', err);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    // Parse timestamp directly without timezone conversion
    const date = new Date(timestamp);
    
    // Get local time components (no timezone conversion)
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-500/20"></div>
        </div>
        <span className="mt-6 text-xl text-white font-medium">Đang tải dữ liệu...</span>
        <span className="mt-2 text-gray-400">Vui lòng chờ trong giây lát</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md mx-auto">
          <div className="text-red-400 text-xl font-semibold mb-4">⚠️ Lỗi tải dữ liệu</div>
          <div className="text-gray-300 mb-6">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 max-w-md mx-auto border border-white/10">
          <div className="text-6xl mb-4">💬</div>
          <div className="text-2xl text-white font-semibold mb-2">Chưa có comment nào</div>
          <div className="text-gray-400">Dữ liệu comment sẽ hiển thị ở đây khi có</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${compact ? 'text-xs' : ''}`}>
      {/* Table */}
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-white`}>Danh sách Comment</h3>
          <div className="text-xs text-gray-400">
            {loading ? 'Đang tải...' : `Tổng: ${totalItems}`}
          </div>
        </div>

        <div className={`overflow-x-auto overflow-y-visible ${compact ? 'pb-24' : 'pb-32'} relative`}>
          <table className={`min-w-full ${compact ? 'table-auto' : 'table-fixed'}`}>
            <colgroup>
              {compact ? (
                <>
                  <col style={{ width: '8rem' }} />
                  <col style={{ width: '12rem' }} />
                  <col style={{ width: '10rem' }} />
                  <col style={{ width: '8rem' }} />
                  <col style={{ width: '1fr' }} />
                  <col style={{ width: '8rem' }} />
                  <col style={{ width: '8rem' }} />
                  <col style={{ width: '7rem' }} />
                </>
              ) : (
                <>
                  <col style={{ width: '12rem' }} />
                  <col style={{ width: '20rem' }} />
                  <col style={{ width: '18rem' }} />
                  <col style={{ width: '12rem' }} />
                  <col style={{ width: '1fr' }} />
                  <col style={{ width: '10rem' }} />
                  <col style={{ width: '11rem' }} />
                  <col style={{ width: '9rem' }} />
                </>
              )}
            </colgroup>
            <thead className="bg-white/5">
              <tr>
                <th className={`${thPad} text-center text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                  Thời gian
                </th>
                <th className={`${thPad} text-center text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                  Tên bài viết
                </th>
                <th className={`${thPad} text-left text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                  UID
                </th>
                <th className={`${thPad} text-left text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                  Tên Facebook
                </th>
                <th className={`${thPad} text-left text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                  Nội dung
                </th>
                <th className={`${thPad} text-center text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                  Số điện thoại
                </th>
                <th className={`${thPad} text-left text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                  Trạng thái
                </th>
                <th className={`${thPad} text-left text-xs font-medium text-gray-300 uppercase tracking-wider`}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-white/5 transition-colors">
                  <td className={`${tdPad} whitespace-nowrap text-sm text-gray-300`}>
                    {formatTimestamp(comment.timestamp)}
                  </td>
                  <td className={`${tdPad} text-sm text-gray-300 align-center`}>
                    <div className="flex items-start space-x-1">
                      {comment.post.link ? (
                        <button
                          onClick={() => window.open(comment.post.link, '_blank')}
                          className={`truncate whitespace-nowrap overflow-hidden flex-1 text-left hover:text-blue-400 underline-offset-2 hover:underline`}
                          title={`Mở bài viết: ${comment.post.link}`}
                        >
                          {abbreviate(comment.post.name, compact ? 25 : 40)}
                        </button>
                      ) : (
                        <div className={`truncate whitespace-nowrap overflow-hidden flex-1`} title={comment.post.name}>
                          {abbreviate(comment.post.name, compact ? 25 : 40)}
                        </div>
                      )}
                      <button
                        onClick={() => copyPost(comment.post.name)}
                        className={`${compact ? 'p-0.5' : 'p-1'} hover:bg-gray-700 rounded transition-colors flex-shrink-0`}
                        title="Copy tên bài viết"
                      >
                        {copiedPost === comment.post.name ? (
                          <Check className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-green-400`} />
                        ) : (
                          <Copy className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 hover:text-white`} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className={`${tdPad} text-sm text-gray-400 font-mono align-center`}> 
                    <div className="flex items-start space-x-1">
                      <button
                        onClick={() => window.open(`https://www.facebook.com/${comment.uid}`, '_blank')}
                        className={`truncate whitespace-nowrap overflow-hidden flex-1 text-left hover:text-blue-400 transition-colors cursor-pointer`}
                        title={`Mở Facebook profile: ${comment.uid}`}
                      >
                        {abbreviate(comment.uid, compact ? 12 : 16)}
                      </button>
                      <button
                        onClick={() => copyUid(comment.uid)}
                        className={`${compact ? 'p-0.5' : 'p-1'} hover:bg-gray-700 rounded transition-colors flex-shrink-0`}
                        title="Copy UID"
                      >
                        {copiedUid === comment.uid ? (
                          <Check className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-green-400`} />
                        ) : (
                          <Copy className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 hover:text-white`} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className={`${tdPad} whitespace-nowrap text-sm text-gray-300`}>
                    {comment.fb_name}
                  </td>
                  <td className={`${tdPad} text-sm text-gray-300 align-center`}>
                    <div className={`truncate whitespace-nowrap overflow-hidden`} title={comment.content}>
                      {abbreviate(comment.content, compact ? 30 : 30)}
                    </div>
                  </td>
                  <td className={`${tdPad} whitespace-nowrap text-sm text-gray-400`}>
                    {comment.phone ? (
                      <button
                        onClick={() => copyPhone(comment.phone!)}
                        className={`flex items-center space-x-1 hover:text-blue-400 transition-colors ${compact ? 'text-xs' : ''}`}
                        title="Click để copy số điện thoại"
                      >
                        <span>{comment.phone}</span>
                        {copiedPhone === comment.phone ? (
                          <Check className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-green-400`} />
                        ) : (
                          <Copy className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 hover:text-white`} />
                        )}
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className={`${tdPad} whitespace-nowrap`}>
                    <StatusDropdown
                      currentStatus={comment.status}
                      onStatusChange={async (status) => {
                        if (updatingId) return;
                        setUpdatingId(comment.id);
                        try {
                          await onStatusChange(comment.id, status);
                        } finally {
                          setUpdatingId(null);
                        }
                      }}
                      compact={compact}
                      loading={updatingId === comment.id}
                      disabled={updatingId !== null}
                    />
                  </td>
                  <td className={`${tdPad} whitespace-nowrap`}>
                    {onCreateOrder && (
                      <button
                        onClick={() => onCreateOrder(comment)}
                        className={`flex items-center space-x-1 ${compact ? 'px-2 py-1' : 'px-3 py-2'} bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
                        title="Tạo đơn hàng từ comment này"
                      >
                        <ShoppingCart className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>Tạo đơn</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Summary */}
      {!compact && (
        <div className="text-sm text-gray-400 text-center">
          Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số {totalItems} comment
        </div>
      )}
    </div>
  );
};

export default CommentsTable;
