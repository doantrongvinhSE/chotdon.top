import React, { useState } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { useOrders } from '../hooks/useOrders';
import CommentsTable from '../components/tables/CommentsTable';
import CreateOrderModal from '../components/forms/CreateOrderModal';
import DateRangeFilter from '../components/filters/DateRangeFilter';
import { Toast } from '../components/ui/Toast';
import { Comment } from '../types/posts';

const CommentsPage: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const {
    comments,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    isRealTime,
    lastUpdate,
    todayCount,
    updateCommentStatus,
    fetchComments,
    setCurrentPage,
    filterCommentsByDate,
    clearDateFilter,
    phoneFilter,
    togglePhoneFilter,
    notificationsEnabled,
    toggleNotifications,
  } = useComments(showToastMessage);

  const { addOrder, addingOrder } = useOrders(showToastMessage);

  const handleRefresh = () => {
    fetchComments();
  };

  const handleCreateOrder = (comment: Comment) => {
    setSelectedComment(comment);
    setShowCreateOrderModal(true);
  };

  const handleCloseCreateOrderModal = () => {
    setShowCreateOrderModal(false);
    setSelectedComment(null);
  };

  const handleSubmitOrder = async (orderData: {
    product_name: string;
    customer_name: string;
    phone: string;
    address: string;
    note: string;
  }) => {
    try {
      await addOrder(orderData);
      handleCloseCreateOrderModal();
    } catch {
      // Error handling được thực hiện trong useOrders hook
    }
  };


  return (
    <div className="min-h-full p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Quản lý Comment
              </h1>
              <p className="text-gray-400 text-sm">
                Theo dõi và quản lý các comment từ Facebook
                {isRealTime && (
                  <span className="ml-2 text-green-400 text-xs">
                    • Cập nhật lần cuối: {lastUpdate}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
            <span className="text-sm font-medium">Làm mới</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-white mb-1">{totalItems}</div>
                <div className="text-xs text-gray-400">Tổng số comment</div>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-yellow-400 mb-1">
                  {todayCount}
                </div>
                <div className="text-xs text-gray-400">Comment hôm nay</div>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      {/* Date Range Filter with Toggle Controls */}
      <DateRangeFilter
        onDateRangeChange={filterCommentsByDate}
        onClear={clearDateFilter}
        phoneFilter={phoneFilter}
        onTogglePhoneFilter={togglePhoneFilter}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={toggleNotifications}
        loading={loading}
      />

      {/* Comments Table */}
      <CommentsTable
        comments={comments}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onStatusChange={updateCommentStatus}
        onPageChange={setCurrentPage}
        onCreateOrder={handleCreateOrder}
        compact={false}
      />

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={showCreateOrderModal}
        onClose={handleCloseCreateOrderModal}
        comment={selectedComment}
        onSubmit={handleSubmitOrder}
        loading={addingOrder}
      />

      {/* Toast */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default CommentsPage;


