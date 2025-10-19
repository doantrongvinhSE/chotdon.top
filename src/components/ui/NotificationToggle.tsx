import React from 'react';
import { Bell, BellOff } from 'lucide-react';

interface NotificationToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  isEnabled,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {isEnabled ? (
          <Bell className="w-4 h-4 text-green-400" />
        ) : (
          <BellOff className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-sm text-gray-300">
          {isEnabled ? 'Chuông bật' : 'Chuông tắt'}
        </span>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${isEnabled 
            ? 'bg-green-600' 
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

export default NotificationToggle;
