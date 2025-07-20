// frontend/lib/toast.ts
// Shared toast utility for consistent notifications across the application

/**
 * Show a toast notification
 * @param message - The message to display
 * @param type - The type of toast (success or error)
 */
export function showToast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = "24px";
  toast.style.right = "24px";
  toast.style.zIndex = "9999";
  toast.style.padding = "12px 24px";
  toast.style.borderRadius = "8px";
  toast.style.color = "#fff";
  toast.style.fontWeight = "bold";
  toast.style.background = type === "success" ? "#22c55e" : "#ef4444";
  toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  toast.style.transition = "opacity 0.4s ease-in-out";
  toast.style.opacity = "1";

  document.body.appendChild(toast);

  // Auto-remove after 2.2 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 400);
  }, 2200);
}

/**
 * Show a success toast with green background
 * @param message - The success message to display
 */
export function showSuccessToast(message: string) {
  showToast({ message, type: "success" });
}

/**
 * Show an error toast with red background
 * @param message - The error message to display
 */
export function showErrorToast(message: string) {
  showToast({ message, type: "error" });
}
