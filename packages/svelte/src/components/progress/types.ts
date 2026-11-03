import type { Progress as Primitive } from 'bits-ui';
import type { ProgressIntent, ProgressSize } from './contract.generated.js';

/** Attributes the component owns: the value, the bounds and the name follow from the props. */
type Owned = 'children' | 'child' | 'value' | 'max' | 'min' | 'aria-label' | 'aria-labelledby' | 'ref';

export interface ProgressOptions {
  /** Progress so far, from 0 to max (a value above max shows a full bar). Ignored when indeterminate. */
  value?: number;
  /** The value of a completed task. Default 100. */
  max?: number;
  /** A longer task under way without a known end: a segment sweeps the track, no value is exposed. */
  indeterminate?: boolean;
  /** What is in progress (Uploading report.pdf). Required and non-empty: the accessible name, shown by default. */
  label: string;
  /** Show the label above the track (default true); false keeps it as the accessible name only. */
  showLabel?: boolean;
  /** Show the percentage at the end of the label line. Default false. */
  showValue?: boolean;
  /** Indicator color: accent (default), success when done, warning when it needs attention, danger when it failed. */
  intent?: ProgressIntent;
  /** Track thickness: sm 4, md 6 (default), lg 8 px. */
  size?: ProgressSize;
  /** The progress bar element. */
  ref?: HTMLElement | null;
}

/** Other attributes (id, class, aria-describedby…) go to the progress bar element. */
export type ProgressProps = ProgressOptions & Omit<Primitive.RootProps, Owned | keyof ProgressOptions>;
