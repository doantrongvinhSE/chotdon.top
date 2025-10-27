import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Order, AddressDetail } from '../../types/posts';
import AddressSelector from '../ui/AddressSelector';

interface OrderFormProps {
  order?: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
  loading?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  onSave, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    product_name: '',
    customer_name: '',
    phone: '',
    address: '',
    note: ''
  });

  const [addressDetail, setAddressDetail] = useState<AddressDetail>({
    province: null,
    district: null,
    ward: null,
    street: '',
    fullAddress: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (order) {
      setFormData({
        product_name: order.product_name,
        customer_name: order.customer_name,
        phone: order.phone,
        address: order.address,
        note: order.note || ''
      });
      
      // Load address detail if available
      if (order.addressDetail) {
        setAddressDetail(order.addressDetail);
      } else {
        setAddressDetail({
          province: null,
          district: null,
          ward: null,
          street: '',
          fullAddress: '',
        });
      }
    } else {
      setFormData({
        product_name: '',
        customer_name: '',
        phone: '',
        address: '',
        note: ''
      });
      setAddressDetail({
        province: null,
        district: null,
        ward: null,
        street: '',
        fullAddress: '',
      });
    }
    setErrors({});
  }, [order, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Tên sản phẩm không được để trống';
    }

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Tên khách hàng không được để trống';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Sử dụng địa chỉ chi tiết nếu có, ngược lại dùng địa chỉ đơn giản
      const addressToUse = addressDetail.fullAddress || formData.address;
      await onSave({
        ...formData,
        address: addressToUse,
        addressDetail: addressDetail.fullAddress ? addressDetail : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {order ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* First row - Product name and Customer name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.product_name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Nhập tên sản phẩm"
              />
              {errors.product_name && (
                <p className="mt-1 text-sm text-red-400">{errors.product_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tên khách hàng *
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customer_name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Nhập tên khách hàng"
              />
              {errors.customer_name && (
                <p className="mt-1 text-sm text-red-400">{errors.customer_name}</p>
              )}
            </div>
          </div>

          {/* Second row - Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Số điện thoại *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Địa chỉ giao hàng *
            </label>
            <AddressSelector
              value={addressDetail}
              onChange={setAddressDetail}
              placeholder="Chọn địa chỉ giao hàng"
              className="mb-3"
            />
            
            {/* Fallback input cho địa chỉ đơn giản */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hoặc nhập địa chỉ thủ công
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Nhập địa chỉ giao hàng"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-400">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Third row - Note */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ghi chú
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập ghi chú (tùy chọn)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {order ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
