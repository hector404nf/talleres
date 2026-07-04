'use client';

import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface OffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Offcanvas({ isOpen, onClose, title, children, size = 'md' }: OffcanvasProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setShow(false);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'w-96',
    md: 'w-[32rem]',
    lg: 'w-[40rem]',
    xl: 'w-[48rem]'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 dark:bg-black/60 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative bg-white dark:bg-gray-900 shadow-2xl h-full overflow-y-auto transition-transform duration-300 ease-out border-l border-gray-100 dark:border-gray-800 ${sizeClasses[size]} ${show ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
