import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { CommentStatus } from '../../types/posts';

interface StatusDropdownProps {
  currentStatus: CommentStatus;
  onStatusChange: (status: CommentStatus) => void;
  disabled?: boolean;
  compact?: boolean;
  loading?: boolean;
}

const statusOptions = [
  { 
    value: 'normal' as CommentStatus, 
    label: 'Bình thường', 
    color: 'bg-gray-500 text-white border-gray-500',
    icon: '📝',
    hoverColor: 'hover:bg-gray-600',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700'
  },
  { 
    value: 'isCalling' as CommentStatus, 
    label: 'Đang gọi điện', 
    color: 'bg-yellow-500 text-white border-yellow-500',
    icon: '📞',
    hoverColor: 'hover:bg-yellow-600',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  { 
    value: 'success' as CommentStatus, 
    label: 'Chốt thành công', 
    color: 'bg-green-500 text-white border-green-500',
    icon: '✅',
    hoverColor: 'hover:bg-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  { 
    value: 'fail' as CommentStatus, 
    label: 'Chốt thất bại', 
    color: 'bg-red-500 text-white border-red-500',
    icon: '❌',
    hoverColor: 'hover:bg-red-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
];

const StatusDropdown: React.FC<StatusDropdownProps> = ({ 
  currentStatus, 
  onStatusChange, 
  disabled = false,
  compact = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const currentOption = statusOptions.find(option => option.value === currentStatus);
  
  const handleStatusChange = (status: CommentStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (disabled || loading) return;
    
    // Check if dropdown should open upward
    const button = document.activeElement as HTMLElement;
    if (button) {
      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 120; // Approximate height of dropdown
      
      if (rect.bottom + dropdownHeight > viewportHeight && rect.top > dropdownHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
    
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`
          flex items-center space-x-2 ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} rounded-lg font-medium transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${currentOption?.color || 'bg-gray-500 text-white border-gray-500'}
          hover:scale-105 active:scale-95 border shadow-sm
        `}
        aria-busy={loading}
      >
        {loading ? (
          <span className={`inline-block ${compact ? 'w-3 h-3' : 'w-4 h-4'} border-2 border-white/60 border-t-transparent rounded-full animate-spin`} />
        ) : (
          <span className={compact ? 'text-xs' : 'text-sm'}>{currentOption?.icon}</span>
        )}
        <span className={`${compact ? 'max-w-20' : 'max-w-24'} truncate`}>{currentOption?.label}</span>
        {!loading && (
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !loading && (
        <div className={`absolute ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 ${compact ? 'w-40' : 'w-48'} bg-white border border-gray-200 rounded-lg shadow-lg z-[999999] overflow-hidden`}>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`
                w-full flex items-center space-x-3 ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} text-left font-medium transition-all duration-200
                ${currentStatus === option.value 
                  ? `${option.bgColor} ${option.textColor} border-l-4 border-l-green-500` 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className={compact ? 'text-xs' : 'text-sm'}>{option.icon}</span>
              <span className="flex-1">{option.label}</span>
              {currentStatus === option.value && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[999998]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default StatusDropdown;
