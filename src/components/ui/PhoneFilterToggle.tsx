import React from 'react';
import { Phone } from 'lucide-react';

interface PhoneFilterToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const PhoneFilterToggle: React.FC<PhoneFilterToggleProps> = ({
  isEnabled,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Phone className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">Chỉ hiện comment có số điện thoại</span>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${isEnabled 
            ? 'bg-blue-600' 
            : 'bg-gray-600'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'
          }
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out
            ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};

export default PhoneFilterToggle;
