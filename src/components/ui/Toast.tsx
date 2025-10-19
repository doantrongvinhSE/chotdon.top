import React from 'react';
import { CheckCircle, X } from 'lucide-react';

type ToastProps = {
  message: string;
  isVisible: boolean;
  onClose: () => void;
};

export function Toast({ message, isVisible, onClose }: ToastProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3 bg-green-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-lg border border-green-400/30">
        <CheckCircle className="w-5 h-5 text-green-100" />
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-green-100 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
