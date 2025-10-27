import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useAddress } from '../../hooks/useAddress';
import { Province, District, Ward, AddressDetail } from '../../types/posts';

interface AddressSelectorProps {
  value: AddressDetail;
  onChange: (address: AddressDetail) => void;
  error?: string;
  className?: string;
  placeholder?: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  value,
  onChange,
  error,
  className = '',
  placeholder = 'Chọn địa chỉ'
}) => {
  const {
    provinces,
    districts,
    wards,
    loading,
    error: apiError,
    fetchDistricts,
    fetchWards,
    resetDistricts,
    resetWards,
  } = useAddress();

  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isWardOpen, setIsWardOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(value.province);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(value.district);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(value.ward);
  const [street, setStreet] = useState(value.street || '');

  // Update local state when value prop changes
  useEffect(() => {
    setSelectedProvince(value.province);
    setSelectedDistrict(value.district);
    setSelectedWard(value.ward);
    setStreet(value.street || '');
  }, [value]);

  // Handle province selection
  const handleProvinceSelect = async (province: Province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    resetDistricts();
    resetWards();
    
    if (province.code) {
      await fetchDistricts(province.code);
    }
    
    updateAddress({
      province,
      district: null,
      ward: null,
      street,
      fullAddress: buildFullAddress(province, null, null, street)
    });
  };

  // Handle district selection
  const handleDistrictSelect = async (district: District) => {
    setSelectedDistrict(district);
    setSelectedWard(null);
    resetWards();
    
    if (district.code) {
      await fetchWards(district.code);
    }
    
    updateAddress({
      province: selectedProvince,
      district,
      ward: null,
      street,
      fullAddress: buildFullAddress(selectedProvince, district, null, street)
    });
  };

  // Handle ward selection
  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    updateAddress({
      province: selectedProvince,
      district: selectedDistrict,
      ward,
      street,
      fullAddress: buildFullAddress(selectedProvince, selectedDistrict, ward, street)
    });
  };

  // Handle street input change
  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStreet = e.target.value;
    setStreet(newStreet);
    updateAddress({
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
      street: newStreet,
      fullAddress: buildFullAddress(selectedProvince, selectedDistrict, selectedWard, newStreet)
    });
  };

  // Build full address string
  const buildFullAddress = (province: Province | null, district: District | null, ward: Ward | null, street: string) => {
    const parts = [];
    if (street) parts.push(street);
    if (ward) parts.push(ward.name);
    if (district) parts.push(district.name);
    if (province) parts.push(province.name);
    return parts.join(', ');
  };

  // Update parent component
  const updateAddress = (newAddress: AddressDetail) => {
    onChange(newAddress);
  };

  const displayText = value.fullAddress || placeholder;

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-4">
        {/* Street input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số nhà, tên đường
          </label>
          <input
            type="text"
            value={street}
            onChange={handleStreetChange}
            placeholder="Nhập số nhà, tên đường"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Address selectors - each full width */}
        <div className="space-y-4">
          {/* Province selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tỉnh/Thành phố *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProvinceOpen(!isProvinceOpen);
                  setIsDistrictOpen(false);
                  setIsWardOpen(false);
                }}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-left text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 flex items-center justify-between ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <span className={selectedProvince ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedProvince ? selectedProvince.name : 'Chọn tỉnh/thành phố'}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isProvinceOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProvinceOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-3 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 mx-auto"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  ) : (
                    provinces.map((province) => (
                      <button
                        key={province.code}
                        type="button"
                        onClick={() => {
                          handleProvinceSelect(province);
                          setIsProvinceOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        {province.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* District selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quận/Huyện *
            </label>
            <div className="relative">
              <button
                type="button"
                disabled={!selectedProvince || districts.length === 0}
                onClick={() => {
                  setIsDistrictOpen(!isDistrictOpen);
                  setIsProvinceOpen(false);
                  setIsWardOpen(false);
                }}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-left text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 flex items-center justify-between ${
                  !selectedProvince || districts.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <span className={selectedDistrict ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedDistrict ? selectedDistrict.name : 'Chọn quận/huyện'}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDistrictOpen && selectedProvince && districts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-3 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 mx-auto"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  ) : (
                    districts.map((district) => (
                      <button
                        key={district.code}
                        type="button"
                        onClick={() => {
                          handleDistrictSelect(district);
                          setIsDistrictOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        {district.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ward selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phường/Xã *
            </label>
            <div className="relative">
              <button
                type="button"
                disabled={!selectedDistrict || wards.length === 0}
                onClick={() => {
                  setIsWardOpen(!isWardOpen);
                  setIsProvinceOpen(false);
                  setIsDistrictOpen(false);
                }}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-left text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 flex items-center justify-between ${
                  !selectedDistrict || wards.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <span className={selectedWard ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedWard ? selectedWard.name : 'Chọn phường/xã'}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isWardOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isWardOpen && selectedDistrict && wards.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-3 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 mx-auto"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  ) : (
                    wards.map((ward) => (
                      <button
                        key={ward.code}
                        type="button"
                        onClick={() => {
                          handleWardSelect(ward);
                          setIsWardOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        {ward.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full address display */}
        {value.fullAddress && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Địa chỉ đầy đủ:</p>
                <p className="text-sm text-gray-600">{value.fullAddress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error messages */}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        
        {apiError && (
          <p className="mt-1 text-sm text-red-500">{apiError}</p>
        )}
      </div>
    </div>
  );
};

export default AddressSelector;
