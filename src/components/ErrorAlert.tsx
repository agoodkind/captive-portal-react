import React from 'react';

interface ErrorAlertProps {
  message: string;
  onClose: () => void;
}

export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-red-700 text-sm">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="text-red-500 hover:text-red-700 font-medium text-sm"
          aria-label="Close error message"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
