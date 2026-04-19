export interface BrandInputs {
  name: string;
  category: string;
  purpose: string;
  audience: string;
  tone: string[];
  avoid: string[];
  notes: string;
}

export interface ToneGuidance {
  attributes: string[];
  voiceNotes: string;
  avoidList: string[];
  examplePhrases: string[];
}

export interface VisualDirection {
  id: string;
  name: string;
  description: string;
  palette: string;
  typography: string;
  references: string;
}

export interface LogoConcept {
  id: string;
  title: string;
  concept: string;
  mark: string;
  execution: string;
}

export interface UsageExample {
  context: string;
  text: string;
}

export interface TypographyToken {
  label: string;
  size: string;
  weight: string;
  lineHeight: string;
  usage: string;
}

export interface Typography {
  primary: string;
  secondary: string;
  mono: string;
  pairNote: string;
  scale: TypographyToken[];
}

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  role: string;
}

export interface ColorPalette {
  swatches: ColorSwatch[];
}

export interface BrandOutputs {
  overview: string;
  positioning: string;
  tone: ToneGuidance;
  titles: string[];
  subtitles: string[];
  taglines: string[];
  visualDirections: VisualDirection[];
  palette: ColorPalette;
  typography: Typography;
  logoConcepts: LogoConcept[];
  usageExamples: UsageExample[];
  constraints: string[];
}

export interface LockedSections {
  overview: boolean;
  positioning: boolean;
  tone: boolean;
  messaging: boolean;
  visual: boolean;
  palette: boolean;
  typography: boolean;
  logo: boolean;
  usage: boolean;
  constraints: boolean;
}

export interface WorkspaceState {
  inputs: BrandInputs;
  outputs: BrandOutputs | null;
  edits: Partial<BrandOutputs>;
  locked: LockedSections;
}
