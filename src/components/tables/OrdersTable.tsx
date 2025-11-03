import React from 'react';
import { Order } from '../../types/posts';
import { Phone, MapPin, Calendar, Package, User, Edit, Trash2, MoreVertical } from 'lucide-react';
import { SoftCheckbox } from '../ui/SoftCheckbox';

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
  deletingOrder?: boolean;
  // Selection controls (optional)
  selectedIds?: number[];
  allSelected?: boolean;
  onToggleSelectAll?: (checked: boolean) => void;
  onToggleSelectOne?: (orderId: number, checked: boolean) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  loading, 
  onEdit, 
  onDelete, 
  deletingOrder = false,
  selectedIds = [],
  allSelected = false,
  onToggleSelectAll,
  onToggleSelectOne,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Đang tải đơn hàng...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Chưa có đơn hàng nào</h3>
        <p className="text-gray-400">Các đơn hàng sẽ được hiển thị ở đây</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden ring-1 ring-gray-700/50 shadow-lg">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              {(onToggleSelectAll || onToggleSelectOne) && (
                <th className="px-4 py-4 w-12">
                  {onToggleSelectAll && (
                    <SoftCheckbox
                      checked={allSelected}
                      onChange={() => onToggleSelectAll(true !== allSelected)}
                      label="Chọn tất cả"
                    />
                  )}
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Địa chỉ
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ghi chú
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {orders.map((order) => (
              <tr
                key={order.id}
                className={`${selectedIds.includes(order.id) ? 'bg-blue-900/20 ring-1 ring-blue-500/20' : 'hover:bg-gray-700'} transition-colors`}
              >
                {(onToggleSelectAll || onToggleSelectOne) && (
                  <td className="px-4 py-4">
                    <SoftCheckbox
                      checked={selectedIds.includes(order.id)}
                      onChange={() => onToggleSelectOne && onToggleSelectOne(order.id, !selectedIds.includes(order.id))}
                      label={`Chọn đơn #${order.id}`}
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  #{order.id}
                </td>
                <td className="px-6 py-4 text-sm text-white font-medium">
                  {order.product_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {order.customer_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {order.phone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                  {order.address}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                  {order.note || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(order)}
                        className="px-3 py-1.5 text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-600/30 rounded-full transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(order)}
                        disabled={deletingOrder}
                        className="px-3 py-1.5 text-red-300 hover:text-white bg-red-500/10 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {orders.map((order) => (
          <div key={order.id} className={`border-b border-gray-700 p-4 hover:bg-gray-700 transition-colors ${selectedIds.includes(order.id) ? 'bg-blue-900/20 ring-1 ring-blue-500/20' : ''} rounded-xl m-2`}> 
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">#{order.id}</span>
              </div>
              <div className="flex items-center space-x-2">
                {(onToggleSelectAll || onToggleSelectOne) && (
                  <SoftCheckbox
                    checked={selectedIds.includes(order.id)}
                    onChange={() => onToggleSelectOne && onToggleSelectOne(order.id, !selectedIds.includes(order.id))}
                    label={`Chọn đơn #${order.id}`}
                  />
                )}
                <span className="text-xs text-gray-400">
                  {formatDate(order.createdAt)}
                </span>
                {(onEdit || onDelete) && (
                  <div className="flex items-center space-x-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(order)}
                        className="px-2 py-1 text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-600/30 rounded-full transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(order)}
                        disabled={deletingOrder}
                        className="px-2 py-1 text-red-300 hover:text-white bg-red-500/10 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <h3 className="text-white font-medium text-sm mb-1">{order.product_name}</h3>
              </div>
              
              <div className="flex items-center text-sm text-gray-300">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span>{order.customer_name}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span>{order.phone}</span>
              </div>
              
              <div className="flex items-start text-sm text-gray-300">
                <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="break-words">{order.address}</span>
              </div>
              
              {order.note && (
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">Ghi chú: </span>
                  <span>{order.note}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersTable;
