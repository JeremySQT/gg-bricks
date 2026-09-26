// Shared types for the tooling: DTCG token sources and resolved values, contracts, components.

export interface Dimension {
  value: number;
  unit: 'px' | 'rem' | 'ms' | 's';
}
export interface Color {
  colorSpace: 'srgb';
  components: [number, number, number];
  alpha?: number;
}
export interface Typography {
  fontFamily: string[] | string;
  fontWeight: number | string;
  fontSize: Dimension | string;
  lineHeight: number | string;
  letterSpacing?: Dimension | string;
  /** OpenType feature tags applied with the role (for example tnum for tabular figures). */
  fontFeatures?: string[];
}
export interface Shadow {
  inset?: boolean;
  offsetX: Dimension | string;
  offsetY: Dimension | string;
  blur: Dimension | string;
  spread: Dimension | string;
  color: Color | string;
}

export type TokenType =
  'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'number' | 'duration' | 'cubicBezier' | 'typography' | 'shadow';

/** A token as written in the sources: `$value` may be an alias `{path}` or contain aliases. */
export interface SourceToken {
  $type: TokenType;
  $value: unknown;
  $description?: string;
}

/** A token after alias resolution (no `{path}` strings remain). */
export interface ResolvedToken extends SourceToken {
  $value: Color | Dimension | Typography | Shadow | Shadow[] | string[] | number[] | number | string;
}

export type TokenMap<T extends SourceToken = ResolvedToken> = Record<string, T>;
export type TokenGroup = { [key: string]: TokenGroup | SourceToken };

export interface Config {
  brands: string[];
  appearances: string[];
  densities: string[];
}

export interface TraceEntry {
  source: string;
  value: unknown;
}

export interface Context {
  id: string;
  brand: string;
  appearance: string;
  density: string;
  tokens: TokenMap;
  trace: Record<string, TraceEntry[]>;
}

// Contracts (mirror of authoring/schemas/component-contract.schema.json)

export interface EnumDecl {
  values: string[];
  default: string;
  bindable?: boolean;
}
export interface BooleanDecl {
  type: 'boolean';
  default: boolean;
  bindable?: boolean;
}
export interface StringDecl {
  type: 'string';
  required?: boolean;
  default?: string;
  bindable?: boolean;
}
export interface NumberDecl {
  type: 'number';
  default: number;
  min?: number;
  max?: number;
  bindable?: boolean;
}
export type PropDecl = EnumDecl | BooleanDecl | StringDecl | NumberDecl;
export type StateDecl = EnumDecl | BooleanDecl;
export interface SlotPart {
  accepts: string[];
  min?: number;
  max?: number;
}
export type Part = Record<string, never> | SlotPart;
export interface EventDecl {
  when: string;
  payload?: string;
}

export interface Contract {
  $schema?: string;
  id: string;
  props: Record<string, PropDecl>;
  parts: Record<string, Part>;
  states: Record<string, StateDecl>;
  events?: Record<string, EventDecl>;
  tokens: Record<string, string>;
  rules: string[];
}

export const isEnum = (d: PropDecl | StateDecl): d is EnumDecl => Array.isArray((d as EnumDecl).values);

export interface ComponentStatus {
  componentId: string | null;
  phase: string;
  [key: string]: unknown;
}

export interface ComponentSource {
  id: string;
  family: string;
  dir: string;
  contractPath: string;
  contract: Contract;
  status: ComponentStatus | null;
}

export interface CheckError {
  code: string;
  message: string;
  path?: string;
  details?: unknown;
}
