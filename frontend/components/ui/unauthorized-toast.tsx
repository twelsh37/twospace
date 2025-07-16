// frontend/components/ui/unauthorized-toast.tsx
// Reusable Unauthorized Access Toast and hook for feature gating

import React, { useEffect, useState } from "react";

interface UnauthorizedToastProps {
  open: boolean;
  message?: string;
  onClose: () => void;
}

export const UnauthorizedToast: React.FC<UnauthorizedToastProps> = ({
  open,
  message = "You do not have authorisation for this feature",
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let fadeInTimeout: NodeJS.Timeout;
    let fadeOutTimeout: NodeJS.Timeout;
    let closeTimeout: NodeJS.Timeout;
    if (open) {
      setVisible(true);
      // Fade in over 1.5s
      fadeInTimeout = setTimeout(() => {
        setVisible(true);
      }, 10);
      // Fade out after 3s visible (1.5s fade in + 3s visible = 4.5s)
      fadeOutTimeout = setTimeout(() => {
        setVisible(false);
      }, 4500);
      // Close after 1.5s fade out (total 6s)
      closeTimeout = setTimeout(() => {
        onClose();
      }, 6000);
    }
    return () => {
      clearTimeout(fadeInTimeout);
      clearTimeout(fadeOutTimeout);
      clearTimeout(closeTimeout);
    };
  }, [open, onClose]);

  return open ? (
    <div
      className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 px-8 py-6 rounded-lg font-semibold text-white shadow-lg border-2 transition-opacity duration-[1500ms] pointer-events-none select-none flex flex-col items-center justify-center min-w-[320px] max-w-[480px]
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      style={{
        background: "#a8001c", // Deep cherry red
        borderColor: "#d90429", // Cherry red border
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        textAlign: "center",
      }}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-3xl font-extrabold uppercase mb-2 tracking-wide text-center">
        UNAUTHORIZED ACCESS
      </div>
      <div className="text-lg font-medium text-center">{message}</div>
    </div>
  ) : null;
};

// Hook to show the unauthorized toast
export function useUnauthorizedToast(): [() => void, React.ReactElement] {
  const [open, setOpen] = useState(false);
  const showToast = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const toast = <UnauthorizedToast open={open} onClose={handleClose} />;
  return [showToast, toast];
}
