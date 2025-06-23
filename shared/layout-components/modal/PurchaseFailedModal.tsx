import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PurchaseFailedModalProps {
  image: string;
  txHash: string;
  isOpen: boolean;
  onClose: () => void;
}


const PurchaseFailedModal: React.FC<PurchaseFailedModalProps> = ({ txHash, image, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>

      <div
        className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 dark:bg-black/60"
        style={{ position: 'fixed', zIndex: 50 }}
        onClick={onClose}
      >
        <div
          ref={modalRef}
          className="w-[95%] z-[9999] max-w-md bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg shadow-2xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-red-500 text-xl font-bold"
            aria-label="Close"
          >
            ×
          </button>

          {/* Header */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <span className="font-semibold text-lg text-center">
              Purchase Failed!
            </span>
          </div>

          <hr className="border-t border-gray-300 dark:border-gray-700 my-4" />

          {/* Image */}
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40 rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
              <Image
                src={image}
                alt=""
                width={140}
                height={140}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col items-center gap-4 text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The listing is no longer valid. Someone else may have purchased it before you.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-row gap-2">
            <Link
              href={`https://basescan.org/tx/${txHash}`}
              className="flex-1 flex items-center justify-center px-3 py-3 rounded-sm bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition text-sm font-medium"
            >
              View transaction
            </Link>
          </div>
        </div>
      </div>

    </>
  );
};

export default PurchaseFailedModal;
