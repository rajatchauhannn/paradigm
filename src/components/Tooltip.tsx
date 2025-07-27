// src/components/Tooltip.tsx

import { useState, useRef, useEffect } from "react";

// Add a 'variant' prop to determine the color scheme
interface TooltipProps {
  text: string;
  learnMoreUrl: string;
  variant?: "info" | "warning"; // <-- New prop
}

export const Tooltip = ({
  text,
  learnMoreUrl,
  variant = "info", // <-- Default to 'info'
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  // --- NEW: Define colors based on the variant ---
  const iconColor = variant === "warning" ? "text-yellow-500" : "text-gray-400";
  const popupBgColor = variant === "warning" ? "bg-yellow-900" : "bg-gray-800";
  const linkColor =
    variant === "warning"
      ? "text-red-300 hover:text-red-100"
      : "text-blue-400 hover:text-blue-300";
  // --- END NEW ---

  return (
    <div className="relative flex items-center">
      <svg
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`h-4 w-4 cursor-pointer ${iconColor}`} // <-- Apply color
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 transform rounded-md p-2 text-center text-xs text-white transition-opacity ${popupBgColor} ${
          // <-- Apply color
          isVisible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {text}
        <a
          href={learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`ml-1 font-semibold ${linkColor}`} // <-- Apply color
          onClick={(e) => e.stopPropagation()}
        >
          Learn More.
        </a>
      </div>
    </div>
  );
};
