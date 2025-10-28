import React, { useMemo, useState } from 'react';
import { ShoppingCart, RefreshCw, Trash2 } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import OrdersTable from '../components/tables/OrdersTable';
import { Pagination } from '../components/ui/Pagination';
import OrderForm from '../components/forms/OrderForm';
import OrderFilters from '../components/filters/OrderFilters';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import { Order } from '../types/posts';

const OrdersPage: React.FC = () => {
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showBulkConfirmDialog, setShowBulkConfirmDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const {
    orders,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    updatingOrder,
    deletingOrder: isDeletingOrder,
    setCurrentPage,
    setSearchTerm,
    fetchOrders,
    updateOrder,
    deleteOrder,
    clearFilters,
  } = useOrders(showToastMessage);

  const currentPageIds = useMemo(() => orders.map(o => o.id), [orders]);
  const allSelected = useMemo(
    () => currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.includes(id)),
    [currentPageIds, selectedIds]
  );

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
  };

  const handleDeleteOrder = (order: Order) => {
    setDeletingOrder(order);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingOrder) {
      try {
        await deleteOrder(deletingOrder.id);
        setShowConfirmDialog(false);
        setDeletingOrder(null);
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleSaveOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, orderData);
        setEditingOrder(null);
      }
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
    setDeletingOrder(null);
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      const merged = Array.from(new Set([...selectedIds, ...currentPageIds]));
      setSelectedIds(merged);
    } else {
      const remaining = selectedIds.filter(id => !currentPageIds.includes(id));
      setSelectedIds(remaining);
    }
  };

  const handleToggleSelectOne = (orderId: number, checked: boolean) => {
    setSelectedIds(prev => {
      if (checked) return prev.includes(orderId) ? prev : [...prev, orderId];
      return prev.filter(id => id !== orderId);
    });
  };

  const openBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setShowBulkConfirmDialog(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      const idsToDelete = [...selectedIds];
      await Promise.all(idsToDelete.map(id => deleteOrder(id)));
      setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)));
      setShowBulkConfirmDialog(false);
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
    }
  };

  return (
    <div className="min-h-full p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <ShoppingCart className="w-8 h-8 text-blue-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-white">Đơn hàng</h1>
            <p className="text-gray-400 text-sm">
              Tổng cộng {totalItems} đơn hàng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={openBulkDelete}
              disabled={isDeletingOrder}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-full transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa đã chọn ({selectedIds.length})
            </button>
          )}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-full transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-400">Lỗi tải dữ liệu</h3>
              <div className="mt-2 text-sm text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearFilters={clearFilters}
      />

      {/* Orders Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg">
        <OrdersTable 
          orders={orders} 
          loading={loading}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          deletingOrder={isDeletingOrder}
          selectedIds={selectedIds}
          allSelected={allSelected}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectOne={handleToggleSelectOne}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Order Form Modal */}
      <OrderForm
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={handleSaveOrder}
        loading={updatingOrder}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Xác nhận xóa đơn hàng"
        message={`Bạn có chắc chắn muốn xóa đơn hàng #${deletingOrder?.id} của ${deletingOrder?.customer_name}?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseConfirmDialog}
        loading={isDeletingOrder}
        type="danger"
      />

      {/* Confirm Bulk Delete Dialog */}
      <ConfirmDialog
        isOpen={showBulkConfirmDialog}
        title="Xác nhận xóa nhiều đơn hàng"
        message={`Bạn có chắc chắn muốn xóa ${selectedIds.length} đơn hàng đã chọn?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setShowBulkConfirmDialog(false)}
        loading={isDeletingOrder}
        type="danger"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          isVisible={!!toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default OrdersPage;


