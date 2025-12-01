import React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Trash2, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

// Backdrop variants
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.25, ease: [0.42, 0, 0.58, 1] } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.2, ease: [0.42, 0, 0.58, 1] } 
  },
};

// Modal variants
const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10, 
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } 
  },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="theme-bg-card theme-shadow-lg border theme-border rounded-2xl w-full max-w-sm p-6 relative"
          >
            {/* Close Button */}
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-[var(--accent-secondary-hover)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--accent-secondary)]">
                <Trash2 className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
            </div>

            {/* Title + Message */}
            <h3 className="text-lg font-semibold text-center theme-text-primary mb-2">
              {title}
            </h3>
            <p className="text-sm text-center theme-text-secondary mb-6">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-5 py-2 rounded-md theme-bg-secondary theme-text-secondary border theme-border hover:bg-[var(--accent-secondary-hover)] transition-colors duration-200"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-5 py-2 rounded-md text-white font-medium bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-opacity duration-200"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
