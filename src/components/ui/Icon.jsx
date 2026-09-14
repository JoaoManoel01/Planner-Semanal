/**
 * Sistema de ícones — SVG outline, viewBox 24, stroke 1.5, currentColor.
 * Nenhum emoji e nenhuma imagem rasterizada na interface.
 */

function Svg({ size = 16, strokeWidth = 1.5, label, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon"
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconChevronLeft = p => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>;
export const IconChevronRight = p => <Svg {...p}><path d="M9 5l7 7-7 7" /></Svg>;
export const IconChevronDown = p => <Svg {...p}><path d="M5 9l7 7 7-7" /></Svg>;

export const IconPlus = p => <Svg {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>;
export const IconClose = p => <Svg {...p}><path d="M6 6l12 12" /><path d="M18 6L6 18" /></Svg>;
export const IconCheck = p => <Svg {...p}><path d="M5 13l4 4L19 7" /></Svg>;

export const IconEdit = p => (
  <Svg {...p}>
    <path d="M4 20h4l10-10a2.1 2.1 0 0 0-3-3L5 17v3z" />
    <path d="M13.5 6.5l4 4" />
  </Svg>
);

export const IconTrash = p => (
  <Svg {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M6 7l1 12h10l1-12" />
  </Svg>
);

export const IconCopy = p => (
  <Svg {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
  </Svg>
);

export const IconCalendar = p => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M3.5 10h17" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
  </Svg>
);

export const IconClock = p => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const IconTarget = p => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3.5" />
  </Svg>
);

export const IconFlag = p => (
  <Svg {...p}>
    <path d="M6 21V4" />
    <path d="M6 5h11l-2 3.5L17 12H6" />
  </Svg>
);

export const IconAlert = p => (
  <Svg {...p}>
    <path d="M12 4.5L21 19.5H3L12 4.5z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </Svg>
);

export const IconBell = p => (
  <Svg {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9z" />
    <path d="M10 18a2 2 0 0 0 4 0" />
  </Svg>
);

export const IconPattern = p => (
  <Svg {...p}>
    <path d="M3 17c3 0 3-10 6-10s3 10 6 10 3-6 6-6" />
  </Svg>
);

export const IconCompass = p => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M15.2 8.8l-1.9 4.5-4.5 1.9 1.9-4.5 4.5-1.9z" />
  </Svg>
);

export const IconTag = p => (
  <Svg {...p}>
    <path d="M4 11V5a1 1 0 0 1 1-1h6l9 9-7 7-9-9z" />
    <path d="M8.5 8.5h.01" />
  </Svg>
);

export const IconSliders = p => (
  <Svg {...p}>
    <path d="M4 8h10" /><path d="M18 8h2" /><circle cx="16" cy="8" r="2" />
    <path d="M4 16h4" /><path d="M12 16h8" /><circle cx="10" cy="16" r="2" />
  </Svg>
);

export const IconMoreVertical = p => (
  <Svg {...p}>
    <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
  </Svg>
);

export const IconDownload = p => (
  <Svg {...p}>
    <path d="M12 4v11" /><path d="M8 11l4 4 4-4" /><path d="M5 19h14" />
  </Svg>
);

export const IconUpload = p => (
  <Svg {...p}>
    <path d="M12 15V4" /><path d="M8 8l4-4 4 4" /><path d="M5 19h14" />
  </Svg>
);

export const IconKeyboard = p => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M7 10h.01" /><path d="M11 10h.01" /><path d="M15 10h.01" /><path d="M8 14h8" />
  </Svg>
);

/** Símbolo da marca: eixo temporal com o instante atual no centro. */
export const IconOrbit = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="icon icon-orbit">
    <ellipse cx="12" cy="12" rx="10" ry="4.4" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
    <ellipse cx="12" cy="12" rx="4.4" ry="10" stroke="currentColor" strokeWidth="1.2" opacity="0.2" />
    <circle cx="12" cy="12" r="2.4" fill="currentColor" />
  </svg>
);

export const ICONES_INSIGHT = {
  conflict: IconAlert,
  deadline: IconFlag,
  attention: IconTarget,
  pattern: IconPattern,
  planning: IconCompass,
  reminder: IconBell
};

export const ICONES_EVENTO = {
  event: IconCalendar,
  deadline: IconFlag,
  milestone: IconTarget,
  reminder: IconBell
};

export const IconUndo = p => (
  <Svg {...p}>
    <path d="M4 9h11a5 5 0 0 1 0 10h-6" />
    <path d="M8 5L4 9l4 4" />
  </Svg>
);
