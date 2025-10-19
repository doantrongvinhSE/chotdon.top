import React, { useState } from 'react';
import CommentsTable from '../components/tables/CommentsTable';
import { Comment, RunningPost, CommentStatus } from '../types/posts';
import { usePosts } from '../hooks/usePosts';
import { useOrders } from '../hooks/useOrders';
import { useFilters } from '../hooks/useFilters';
import { PostForm } from '../components/forms/PostForm';
import { BulkAddModal } from '../components/forms/BulkAddModal';
import { FilterControls } from '../components/filters/FilterControls';
import { PostsTable } from '../components/tables/PostsTable';
import { Toast } from '../components/ui/Toast';
import { Pagination } from '../components/ui/Pagination';
import { AutoPollingIndicator } from '../components/ui/AutoPollingIndicator';
import { ExportButton } from '../components/ui/ExportButton';
import { EditPostModal } from '../components/forms/EditPostModal';
import CreateOrderModal from '../components/forms/CreateOrderModal';

export default function PostsPage() {
  const {
    allItems,
    loading,
    error,
    addingPost,
    addingBulk,
    bulkProgress,
    currentPage,
    itemsPerPage,
    addPost,
    addBulkPosts,
    updatePost,
    toggleItemVisibility,
    toggleSelectAll,
    toggleSelectOne,
    deletePost,
    deleteSelectedPosts,
    setCurrentPage,
    // Realtime polling
    isPolling,
    lastPollTime,
  } = usePosts(showToastMessage);

  const {
    searchTitle,
    setSearchTitle,
    filterStatus,
    setFilterStatus,
    filteredAndSortedItems,
    handleSort,
    clearFilters,
  } = useFilters(allItems);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTitle, filterStatus, setCurrentPage]);

  const [selectAll, setSelectAll] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<typeof allItems[0] | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const commentsPerPage = 10;
  const [currentPostTitle, setCurrentPostTitle] = useState<string>('');
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const { addOrder, addingOrder } = useOrders(showToastMessage);

  function showToastMessage(message: string) {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  type ApiComment = {
    id: string;
    uid: string;
    fb_name: string;
    content: string;
    phone: string | null;
    timestamp: string;
    status: 'normal' | 'fail' | 'success';
    id_post: string;
  };

  async function openCommentsForPost(feedback: string, postTitle: string) {
    try {
      setCommentsLoading(true);
      setCommentsError(null);
      setComments([]);
      setCommentsPage(1);
      setCurrentPostTitle(postTitle);
      const resp = await fetch(`http://160.250.133.235/posts/comments/${feedback}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      const data: ApiComment[] = json?.data ?? [];
      // Map server shape to Comment type if needed: ensure post field exists
      const mapped: Comment[] = data.map((c) => ({
        id: c.id,
        uid: c.uid,
        fb_name: c.fb_name,
        content: c.content,
        phone: c.phone ?? null,
        timestamp: c.timestamp,
        status: c.status,
        id_post: c.id_post,
        post: {
          id: 0,
          name: postTitle,
          link: '',
        },
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setComments(mapped);
      setShowCommentsModal(true);
    } catch (e) {
      console.error(e);
      setCommentsError('Không thể tải comment.');
      setShowCommentsModal(true);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleAddPost(post: Omit<typeof allItems[0], 'id'>) {
    await addPost(post);
  }

  function handleCreateOrder(comment: Comment) {
    setSelectedComment(comment);
    setShowCreateOrderModal(true);
  }

  function handleCloseCreateOrderModal() {
    setShowCreateOrderModal(false);
    setSelectedComment(null);
  }

  async function handleSubmitOrder(orderData: {
    product_name: string;
    customer_name: string;
    phone: string;
    address: string;
    note: string;
  }) {
    try {
      await addOrder(orderData);
      handleCloseCreateOrderModal();
    } catch {
      // lỗi đã xử lý trong hook useOrders
    }
  }

  async function handleCommentStatusChange(commentId: string, status: CommentStatus) {
    try {
      console.log('Updating comment status:', { commentId, status });
      
      const response = await fetch('http://160.250.133.235/comments/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: commentId,
          status: status
        }),
      });

      console.log('API Response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('API Result:', result);

      if (result.success && result.data) {
        // Cập nhật trạng thái trong local state với dữ liệu từ server
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, status: result.data.status }
              : comment
          )
        );
        showToastMessage('Cập nhật trạng thái thành công');
      } else {
        throw new Error(result.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
      showToastMessage(`Lỗi cập nhật trạng thái: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function handleBulkAdd(posts: Array<{ url: string; title: string }>) {
    const newPosts = posts.map(post => ({
      ...post,
      isVisible: true,
      commentCountToday: 0,
      lastCommentAt: null,
      status: 'Đang chạy' as const,
    }));
    await addBulkPosts(newPosts);
  }

  function handleEditPost(post: typeof allItems[0]) {
    setEditingPost(post);
    setShowEditModal(true);
  }

  async function handleUpdatePost(id: string, data: { name: string; link: string }) {
    await updatePost(id, data);
    setShowEditModal(false);
    setEditingPost(null);
  }

  function handleToggleSelectAll() {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    toggleSelectAll(newSelectAll);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  // Get paginated filtered items
  const getPaginatedFilteredItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, endIndex);
  };

  return (
    <div className="min-h-full p-6 space-y-6">
      {/* Form tạo bài viết */}
      <PostForm
        onSubmit={handleAddPost}
        onBulkClick={() => setShowBulkModal(true)}
        addingPost={addingPost}
        addingBulk={addingBulk}
        bulkProgress={bulkProgress}
      />

      {/* Danh sách link đang chạy */}
      <div className="rounded-2xl p-6 bg-white/5 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md relative z-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-white">Link đang chạy</h3>
            <AutoPollingIndicator
              isPolling={isPolling}
              lastPollTime={lastPollTime}
            />
          </div>
          <div className="flex items-center gap-4">
            <ExportButton items={filteredAndSortedItems} />
            <div className="text-xs text-gray-400">
              {loading ? 'Đang tải...' : `Tổng: ${filteredAndSortedItems.length}`}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-500/40 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-400">Đang tải dữ liệu...</span>
            </div>
          </div>
        ) : (
          <>
            <FilterControls
              searchTitle={searchTitle}
              onSearchTitleChange={setSearchTitle}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              onClearFilters={clearFilters}
              onDeleteSelected={deleteSelectedPosts}
              selectedCount={filteredAndSortedItems.filter(item => item.selected).length}
            />
            <PostsTable
              items={getPaginatedFilteredItems()}
              selectAll={selectAll}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleSelectOne={toggleSelectOne}
              onToggleItemVisibility={toggleItemVisibility}
              onDeletePost={deletePost}
              onEditPost={handleEditPost}
              onSort={handleSort}
              onClickTodayComments={(post: RunningPost) => {
                // use feedback if available, otherwise fallback to post.id
                const feedback = post.feedback || post.id;
                openCommentsForPost(feedback, post.title);
              }}
            />
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndSortedItems.length / itemsPerPage)}
              onPageChange={handlePageChange}
              totalItems={filteredAndSortedItems.length}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </div>

      {/* Modal thêm hàng loạt */}
      <BulkAddModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSubmit={handleBulkAdd}
      />

      {/* Modal chỉnh sửa bài viết */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPost(null);
        }}
        onSubmit={handleUpdatePost}
        post={editingPost}
      />

      {/* Toast thông báo */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Modal hiển thị comments theo post - dialog nhỏ, chữ nhỏ */}
      {showCommentsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-40">
          <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-[95rem] max-h-[95vh] overflow-visible shadow-2xl">
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/10">
              <div className="text-sm md:text-base font-semibold text-white">Comment của: {currentPostTitle}</div>
              <button
                onClick={() => setShowCommentsModal(false)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-sm"
              >Đóng</button>
            </div>
            <div className="p-3 md:p-4 overflow-y-auto relative pb-16">
              <CommentsTable
                comments={comments.slice((commentsPage-1)*commentsPerPage, commentsPage*commentsPerPage)}
                loading={commentsLoading}
                error={commentsError}
                currentPage={commentsPage}
                totalPages={Math.ceil(comments.length / commentsPerPage) || 1}
                totalItems={comments.length}
                itemsPerPage={commentsPerPage}
                onStatusChange={handleCommentStatusChange}
                onPageChange={(p) => setCommentsPage(p)}
                compact
                onCreateOrder={handleCreateOrder}
              />
            </div>
            {/* Create Order Modal in PostsPage */}
            <CreateOrderModal
              isOpen={showCreateOrderModal}
              onClose={handleCloseCreateOrderModal}
              comment={selectedComment}
              onSubmit={handleSubmitOrder}
              loading={addingOrder}
            />
          </div>
        </div>
      )}
    </div>
  );
}