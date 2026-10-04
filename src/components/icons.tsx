export const IconPlus = () => (
  <svg viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path className="v" d="M20 12v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconArrow = () => (
  <svg viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <g className="arrow-up">
      <path d="M20 28V12M13 19l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

export const Star = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 1.8l3 6.9 7.5.7-5.7 5 1.7 7.4L12 17.8 5.5 21.8l1.7-7.4-5.7-5 7.5-.7z" />
  </svg>
);
