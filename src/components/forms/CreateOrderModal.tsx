import React, { useState, useEffect } from 'react';
import { Comment, AddressDetail } from '../../types/posts';
import { X, ShoppingCart } from 'lucide-react';
import AddressSelector from '../ui/AddressSelector';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: Comment | null;
  onSubmit: (orderData: {
    product_name: string;
    customer_name: string;
    phone: string;
    address: string;
    addressDetail?: AddressDetail;
    note: string;
  }) => Promise<void>;
  loading?: boolean;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  comment,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    product_name: '',
    customer_name: '',
    phone: '',
    address: '',
    note: '',
  });

  const [addressDetail, setAddressDetail] = useState<AddressDetail>({
    province: null,
    district: null,
    ward: null,
    street: '',
    fullAddress: '',
  });

  // Tự động điền form từ comment khi modal mở
  useEffect(() => {
    if (comment && isOpen) {
      setFormData({
        product_name: comment.post.name || '',
        customer_name: comment.fb_name || '',
        phone: comment.phone || '',
        address: '', // Địa chỉ cần nhập thủ công
        note: '',
      });
    }
  }, [comment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Sử dụng địa chỉ chi tiết nếu có, ngược lại dùng địa chỉ đơn giản
      const addressToUse = addressDetail.fullAddress || formData.address;
      await onSubmit({
        ...formData,
        address: addressToUse,
        addressDetail: addressDetail.fullAddress ? addressDetail : undefined,
      });
      onClose();
    } catch (error) {
      // Error handling được thực hiện trong parent component
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tạo đơn hàng</h2>
              <p className="text-sm text-gray-600">Từ thông tin comment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách hàng *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập tên khách hàng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="Nhập ghi chú (tùy chọn)"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ giao hàng *
                </label>
                <AddressSelector
                  value={addressDetail}
                  onChange={setAddressDetail}
                  placeholder="Chọn địa chỉ giao hàng"
                />

                {/* Fallback input cho địa chỉ đơn giản */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hoặc nhập địa chỉ thủ công
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nhập địa chỉ giao hàng"
                  />
                </div>
              </div>

              
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
            >
              {loading ? 'Đang tạo...' : 'Tạo đơn hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;
