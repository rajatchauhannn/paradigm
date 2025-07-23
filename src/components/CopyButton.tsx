// src/components/CopyButton.tsx
import { useState } from "react";

interface CopyButtonProps {
  contentToCopy: string;
}

export const CopyButton = ({ contentToCopy }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (isCopied) return; // Prevent multiple clicks while in "copied" state
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    } finally {
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Icon SVGs
  const CopyIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );

  const CheckIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="absolute top-3 right-3 p-2 rounded-lg bg-gray-700 bg-opacity-40 text-gray-100 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-all duration-150"
      aria-label="Copy to clipboard"
    >
      {isCopied ? CheckIcon : CopyIcon}
    </button>
  );
};
