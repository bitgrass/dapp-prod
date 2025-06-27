import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Confetti from 'react-confetti-boom';
import WarpcastIcon from '../images/WarpcastIcon';
import XIcon from '../images/XIcon';

interface PurchaseCelebrationModalProps {
  image: string;
  name: string;
  id: string;
  token: string;
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseCelebrationModal: React.FC<PurchaseCelebrationModalProps> = ({ image, name, token, id, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const currentUrl = typeof window !== "undefined"
        ? window.location.href.replace(/\/$/, "")
        : "";
    const shareTextTwitter = `Checkout $${name} on @bitgrass`;
    const shareTextWarpcast = `Checkout $${name} on @bitgrass`;


    const encodedTextTwitter = encodeURIComponent(shareTextTwitter);
    const encodedTextWarpcast = encodeURIComponent(shareTextWarpcast);

    const encodedLink = encodeURIComponent(currentUrl);



    const twitterUrl = `https://x.com/intent/post?text=${encodedTextTwitter}%0A%0A${encodedLink}?ref=twitter_1`;
    const warpcastUrl = `https://farcaster.xyz/~/compose?text=${encodedTextWarpcast}&embeds[]=${encodedLink}`;

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
      <Confetti style={{ zIndex: 51 }} mode="fall" particleCount={70} colors={['#0F382B', '#66CC33', '#7FC447', '#F5F3EB']} />
      <Confetti style={{ zIndex: 51 }} mode="boom" effectInterval={10000} particleCount={80} colors={['#0F382B', '#66CC33', '#7FC447', '#F5F3EB']} effectCount={2} />

      <div
        className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 dark:bg-black/50"
        style={{ position: 'fixed', zIndex: 50 }}
        onClick={onClose}
      >
        <div
          ref={modalRef}
          className="w-[95%] z-[9999] max-w-md bg-camel rounded-lg shadow-2xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton X en haut à droite */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-red-500 text-xl font-bold"
            aria-label="Close"
          >
            ×
          </button>

          {/* Header */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <span className="font-semibold text-lg text-gray-900 dark:text-white text-center">
              Congratulations on Your Purchase!
            </span>
          </div>

          <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />

          {/* Image */}
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40 rounded-md overflow-hidden">
              <Image
                src={image}
                alt={name}
                width={140}
                height={140}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center gap-4 text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You just purchased{' '} <span className="text-sm text-secondary">Plot #{id}.</span> <br />

              from the {' '} {name}


            </p>
          </div>

          <div className="flex flex items-center mb-4" style={{placeSelf:'center'}}>
            <span className="font-medium text-sm text-gray-900 dark:text-white mb-2 text-center">
              Share to...
            </span>

            <div className="flex items-center gap-1 ms-2">
              <button
                onClick={() => window.open(twitterUrl, "_blank")}
                className="w-6 h-6 rounded-full border border-[#7FC447] bg-transparent flex items-center justify-center transition-colors duration-200 hover:bg-[#7FC447]/10"
              >
                <XIcon size={14} color="#7FC447" />
              </button>

              <button
                onClick={() => window.open(warpcastUrl, "_blank")}
                className="w-6 h-6 rounded-full border border-[#7FC447] bg-transparent flex items-center justify-center transition-colors duration-200 hover:bg-[#7FC447]/10"
              >
                <WarpcastIcon size={14} color="#7FC447" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-row gap-2">
            <Link
              href={`https://opensea.io/item/base/${token}/${id}`}
              className="flex-1 flex items-center justify-center px-3 py-3 rounded-sm bg-camel10 dark:bg-[#FFFFFF0D] text-gray-900 dark:text-gray-300 hover:bg-camel20 dark:hover:bg-[#FFFFFF1A] transition text-sm font-medium"
            >
              View Item on Opensea
            </Link>
            <Link
              href="/portfolio#nfts-tab-pane"
              className="flex-1 flex items-center justify-center px-3 py-3 rounded-sm bg-[#7FC447] text-white hover:bg-[#6DB83C] transition text-sm font-medium"
            >
              View Item on Portfolio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseCelebrationModal;
