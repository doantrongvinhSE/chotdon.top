import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import PhoneFilterToggle from '../ui/PhoneFilterToggle';
import NotificationToggle from '../ui/NotificationToggle';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onClear: () => void;
  phoneFilter?: boolean;
  onTogglePhoneFilter?: () => void;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
  loading?: boolean;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onDateRangeChange,
  onClear,
  phoneFilter = false,
  onTogglePhoneFilter,
  notificationsEnabled = false,
  onToggleNotifications,
  loading = false,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onClear();
  };

  const isDisabled = !startDate || !endDate;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Date Range Filter */}
        <div className="flex items-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Lọc theo thời gian:</span>
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="Từ ngày"
          />

          <span className="text-gray-400 text-sm">→</span>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="Đến ngày"
          />

          <button
            onClick={handleApply}
            disabled={isDisabled}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium text-sm"
          >
            Áp dụng
          </button>

          {startDate && endDate && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Xóa bộ lọc"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Toggle Controls */}
        {(onTogglePhoneFilter || onToggleNotifications) && (
          <div className="flex flex-col sm:flex-row gap-4 lg:ml-auto">
            {/* Phone Filter Toggle */}
            {onTogglePhoneFilter && (
              <div className="flex-shrink-0">
                <PhoneFilterToggle
                  isEnabled={phoneFilter}
                  onToggle={onTogglePhoneFilter}
                  disabled={loading}
                />
              </div>
            )}

            {/* Notification Toggle */}
            {onToggleNotifications && (
              <div className="flex-shrink-0">
                <NotificationToggle
                  isEnabled={notificationsEnabled}
                  onToggle={onToggleNotifications}
                  disabled={loading}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
