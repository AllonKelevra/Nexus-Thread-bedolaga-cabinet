export const PARTNER_STATS = {
  /** Chart visual configuration */
  CHART: {
    HEIGHT: 200,
    MARGIN: { top: 5, right: 10, left: 0, bottom: 5 },
  },
  /** Kopeks-to-currency divisor */
  KOPEKS_DIVISOR: 100,
  /** Copy feedback duration in ms */
  COPY_FEEDBACK_MS: 2000,
  /** Gradient stop offsets */
  GRADIENT: {
    START_OFFSET: '5%',
    END_OFFSET: '95%',
    START_OPACITY: 0.3,
    END_OPACITY: 0,
  },
  /** Axis tick styling */
  AXIS: {
    TICK_FONT_SIZE: 11,
    EARNINGS_WIDTH: 45,
    REFERRALS_WIDTH: 30,
  },
  /** Tooltip styling */
  TOOLTIP: {
    BORDER_RADIUS: '8px',
    FONT_SIZE: '12px',
  },
  /** Area stroke width */
  STROKE_WIDTH: 2,
  /** Grid dash array */
  GRID_DASH: '3 3',
  /** Skeleton count for loading state */
  SKELETON_COUNT: 3,
  /** Maximum conversion rate for progress bar */
  MAX_CONVERSION_RATE: 100,
  /** Stale time for campaign stats query (ms) */
  STATS_STALE_TIME: 60_000,
} as const;
