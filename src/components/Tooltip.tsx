// src/components/Tooltip.tsx

interface TooltipProps {
  text: string;
  learnMoreUrl: string;
}

export const Tooltip = ({ text, learnMoreUrl }: TooltipProps) => {
  return (
    <div className="group relative flex items-center">
      {/* Icon */}
      <svg
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
      {/* Tooltip Popup */}
      <div className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 transform rounded-md bg-gray-800 p-2 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {text}
        <a
          href={learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 font-semibold text-blue-400 hover:text-blue-300"
          onClick={(e) => e.stopPropagation()} // Prevents any parent onClick handlers from firing
        >
          Learn More.
        </a>
      </div>
    </div>
  );
};
