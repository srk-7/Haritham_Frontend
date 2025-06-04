export default function Logo({ className = "w-8 h-8" }) {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AgriMarket Logo"
        role="img"
      >
        {/* Leaf */}
        <path
          d="M32 2C20 14 14 32 14 32s4 18 18 18 18-18 18-18-6-18-18-18z"
          fill="#22c55e"
          stroke="#15803d"
          strokeWidth="2"
        />
        {/* Vein */}
        <path
          d="M32 2v36"
          stroke="#166534"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  