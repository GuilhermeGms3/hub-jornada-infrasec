export function Icon({ kind = 0 }: { kind?: number }) {
  const paths = [
    'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
    'M4 20V12m6 8V7m6 13V3m4 17H2',
    'M4 5h16v16H4zM8 3v4m8-4v4M4 11h16',
    'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',
    'M12 3v6m0 6v6M3 12h6m6 0h6M9 9h6v6H9z',
    'M3 5h18v13H3zM8 22h8m-4-4v4',
  ];
  return (
    <svg
      className="nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[kind % paths.length]} />
    </svg>
  );
}
export function ConnectionSketch() {
  return (
    <svg
      className="connection-sketch"
      viewBox="0 0 360 110"
      role="img"
      aria-label="Computador, gateway e internet: esquema simplificado; DNS e demais etapas aparecem na unidade."
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <rect x="12" y="25" width="48" height="34" rx="3" />
        <path d="M6 65h60l-4 5H10zM87 48h38m-7-5 7 5-7 5" />
        <rect x="148" y="39" width="58" height="25" rx="4" />
        <path d="M157 64v5m40-5v5m-36-48q16-14 32 0m-26 6q10-8 20 0M228 48h38m-7-5 7 5-7 5" />
        <circle cx="312" cy="46" r="28" />
        <ellipse cx="312" cy="46" rx="12" ry="28" />
        <path d="M285 38h54m-54 16h54" />
      </g>
      <g fill="currentColor" fontSize="11" textAnchor="middle">
        <text x="36" y="95">
          Computador
        </text>
        <text x="177" y="95">
          Gateway
        </text>
        <text x="312" y="95">
          Internet
        </text>
      </g>
    </svg>
  );
}
