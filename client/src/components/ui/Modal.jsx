import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal — accessible, animated dialog with backdrop blur
 * Props: isOpen, onClose, title, children, size ('sm'|'md'|'lg'|'xl'|'full')
 */
const sizeMap = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[90vw]',
};

const Modal = ({ isOpen, onClose, title, children, size = 'md', hideClose = false }) => {
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-backdrop animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className={`modal-box ${sizeMap[size] || sizeMap.md} w-full max-h-[90vh] flex flex-col`}>
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-auto"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
