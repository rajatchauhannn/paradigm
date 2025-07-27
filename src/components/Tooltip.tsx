// src/components/Tooltip.tsx

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  text: string;
  learnMoreUrl: string;
}

export const Tooltip = ({ text, learnMoreUrl }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  // A ref is used to store the timer ID so it can be cleared.
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // This effect ensures that if the component is removed from the screen,
  // any pending timer is cleared to prevent errors.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Fired when the mouse enters the icon OR the tooltip popup.
  const handleMouseEnter = () => {
    // If a timer is set to hide the tooltip, cancel it.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Show the tooltip.
    setIsVisible(true);
  };

  // Fired when the mouse leaves the icon OR the tooltip popup.
  const handleMouseLeave = () => {
    // Set a short timer to hide the tooltip.
    // This gives the user a moment to move their mouse to the popup.
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200); // 200ms delay
  };

  return (
    <div className="relative flex items-center">
      {/* Icon event handlers */}
      <svg
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="h-4 w-4 cursor-pointer text-gray-400"
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
      {/* 
        The tooltip popup itself also gets the event handlers.
        When the mouse enters this div, it will cancel the "hide" timer.
        When it leaves, it will start a new "hide" timer.
      */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 transform rounded-md bg-gray-800 p-2 text-center text-xs text-white transition-opacity ${
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
          className="ml-1 font-semibold text-blue-400 hover:text-blue-300"
          onClick={(e) => e.stopPropagation()}
        >
          Learn More.
        </a>
      </div>
    </div>
  );
};
