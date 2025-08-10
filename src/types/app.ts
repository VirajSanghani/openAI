import type { User } from "./user";

// Component Types
export type ComponentType = 
  | "stat"
  | "card" 
  | "input"
  | "textarea"
  | "button"
  | "table"
  | "chart"
  | "checklist"
  | "form"
  | "image"
  | "video"
  | "audio"
  | "map"
  | "calendar"
  | "kanban"
  | "timeline"
  | "dashboard"
  | "list"
  | "grid"
  | "tabs"
  | "accordion"
  | "modal"
  | "drawer"
  | "tooltip"
  | "popover"
  | "dropdown"
  | "navigation";

// Theme and Styling
export interface Theme {
  palette: "indigo" | "violet" | "mint" | "sunrise" | "rose";
  radius: number; // 6-30
  blur: number; // 0-40
  density: number; // 6-24
  glass: number; // 0-1
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export interface ComponentStyle {
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  borderRadius?: string;
  boxShadow?: string;
}

// Component Schema
export interface BaseComponent {
  id: string;
  type: ComponentType;
  label?: string;
  placeholder?: string;
  value?: unknown;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  style?: ComponentStyle;
  className?: string;
  metadata?: {
    version: string;
    created: Date;
    modified: Date;
    author: string;
  };
  validation?: {
    rules: ValidationRule[];
    errorMessage?: string;
  };
  permissions?: {
    view: string[];
    edit: string[];
  };
}

export interface StatComponent extends BaseComponent {
  type: "stat";
  label: string;
  value: string | number;
  hint?: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
  format?: "number" | "currency" | "percentage";
}

export interface CardComponent extends BaseComponent {
  type: "card";
  title: string;
  body?: string;
  image?: string;
  actions?: ButtonComponent[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface InputComponent extends BaseComponent {
  type: "input";
  inputType?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface TextareaComponent extends BaseComponent {
  type: "textarea";
  rows?: number;
  cols?: number;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

export interface ButtonComponent extends BaseComponent {
  type: "button";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  action?: string;
  loading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
}

export interface TableComponent extends BaseComponent {
  type: "table";
  columns: TableColumn[];
  rows: unknown[][];
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  selectable?: boolean;
  searchable?: boolean;
}

export interface TableColumn {
  id: string;
  header: string;
  accessor: string;
  type?: "string" | "number" | "date" | "boolean" | "currency";
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: unknown) => string;
}

export interface ChartComponent extends BaseComponent {
  type: "chart";
  chartType: "line" | "bar" | "area" | "pie" | "doughnut" | "scatter" | "radar";
  data: ChartData;
  options?: ChartOptions;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: "top" | "bottom" | "left" | "right";
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: { display?: boolean; text?: string };
    };
    y?: {
      display?: boolean;
      title?: { display?: boolean; text?: string };
    };
  };
}

export interface ChecklistComponent extends BaseComponent {
  type: "checklist";
  title?: string;
  items: ChecklistItem[];
  allowAdd?: boolean;
  allowDelete?: boolean;
  allowReorder?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  disabled?: boolean;
  metadata?: {
    created: Date;
    completed?: Date;
    priority?: "low" | "medium" | "high";
  };
}

export type Component = 
  | StatComponent
  | CardComponent
  | InputComponent
  | TextareaComponent
  | ButtonComponent
  | TableComponent
  | ChartComponent
  | ChecklistComponent;

// Validation
export interface ValidationRule {
  type: "required" | "min" | "max" | "pattern" | "custom";
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean;
}

// Layout System
export type LayoutType = "single" | "two-column" | "three-column" | "dashboard" | "grid" | "flex";

export interface LayoutGrid {
  columns: number;
  rows?: number;
  gap: number;
  areas?: GridArea[];
}

export interface GridArea {
  name: string;
  column: string;
  row: string;
}

// App Connections and Logic
export interface Connection {
  id: string;
  source: {
    componentId: string;
    output?: string;
  };
  target: {
    componentId: string;
    input?: string;
  };
  transform?: {
    type: "map" | "filter" | "reduce" | "custom";
    code?: string;
    mapping?: Record<string, string>;
  };
  condition?: {
    type: "always" | "when" | "unless";
    expression?: string;
  };
}

// App Configuration
export interface AppConfiguration {
  cors?: {
    enabled: boolean;
    origins: string[];
  };
  rateLimit?: {
    enabled: boolean;
    requests: number;
    window: number; // seconds
  };
  authentication?: {
    required: boolean;
    providers: ("email" | "google" | "github" | "microsoft")[];
  };
  database?: {
    enabled: boolean;
    tables: DatabaseTable[];
  };
  apis?: {
    enabled: boolean;
    endpoints: ApiEndpoint[];
  };
  storage?: {
    enabled: boolean;
    maxFileSize: number;
    allowedTypes: string[];
  };
}

export interface DatabaseTable {
  name: string;
  fields: DatabaseField[];
  relationships?: DatabaseRelationship[];
}

export interface DatabaseField {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "json" | "file";
  required: boolean;
  unique?: boolean;
  defaultValue?: unknown;
  validation?: ValidationRule[];
}

export interface DatabaseRelationship {
  type: "oneToOne" | "oneToMany" | "manyToMany";
  table: string;
  field: string;
  onDelete?: "cascade" | "restrict" | "setNull";
}

export interface ApiEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  handler: string; // component ID or code
  auth?: boolean;
  rateLimit?: number;
  validation?: {
    body?: ValidationRule[];
    query?: ValidationRule[];
    params?: ValidationRule[];
  };
}

// App Requirements
export interface AppRequirements {
  executionTime: number; // max milliseconds
  memory: number; // max bytes
  cost: number; // max dollars per execution
  storage: number; // max bytes
  bandwidth: number; // max bytes per month
  apis: number; // max API calls per month
}

// Main App Schema
export interface AppManifest {
  version: "1.0";
  metadata: {
    name: string;
    description: string;
    author: string;
    license: string;
    tags: string[];
    category: AppCategory;
    icon?: string;
    screenshots?: string[];
    readme?: string;
    changelog?: string;
    website?: string;
    repository?: string;
  };
  inputs: InputSchema[];
  outputs: OutputSchema[];
  components: Component[];
  connections: Connection[];
  layout: LayoutConfig;
  theme: Theme;
  configuration: AppConfiguration;
  requirements: AppRequirements;
  permissions: AppPermissions;
}

export interface InputSchema {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "date" | "file" | "json";
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  validation?: ValidationRule[];
  ui?: {
    component: ComponentType;
    props?: Record<string, unknown>;
  };
}

export interface OutputSchema {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "date" | "file" | "json" | "void";
  description?: string;
  ui?: {
    component: ComponentType;
    props?: Record<string, unknown>;
  };
}

export interface LayoutConfig {
  type: LayoutType;
  grid?: LayoutGrid;
  responsive?: {
    breakpoints: Record<string, number>;
    behavior: Record<string, LayoutType>;
  };
}

export interface AppPermissions {
  public: boolean;
  allowFork: boolean;
  allowCommercialUse: boolean;
  requiredRoles?: string[];
  restrictedRegions?: string[];
  ageRestriction?: number;
}

export type AppCategory = 
  | "productivity"
  | "business"
  | "analytics"
  | "communication"
  | "education"
  | "entertainment"
  | "finance"
  | "health"
  | "marketing"
  | "development"
  | "design"
  | "utilities"
  | "social"
  | "e-commerce"
  | "content";

// App Instance
export interface App {
  id: string;
  manifest: AppManifest;
  owner: User;
  collaborators: AppCollaborator[];
  visibility: "private" | "public" | "unlisted" | "organization";
  status: "draft" | "published" | "archived" | "deprecated";
  version: SemanticVersion;
  versions: AppVersion[];
  stats: AppStats;
  pricing?: PricingModel;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface AppCollaborator {
  user: User;
  role: "viewer" | "editor" | "admin";
  permissions: string[];
  invitedBy: User;
  invitedAt: Date;
  acceptedAt?: Date;
}

export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

export interface AppVersion {
  version: SemanticVersion;
  manifest: AppManifest;
  changelog: string;
  createdAt: Date;
  createdBy: User;
  downloads: number;
  deprecated?: boolean;
}

export interface AppStats {
  views: number;
  installs: number;
  executions: number;
  forks: number;
  likes: number;
  rating: number;
  reviews: number;
  activeUsers: number;
  revenue?: number;
  lastUsed?: Date;
}

export interface PricingModel {
  type: "free" | "one-time" | "subscription" | "usage-based" | "freemium";
  price?: number;
  currency?: string;
  interval?: "month" | "year";
  tiers?: PricingTier[];
  usageLimits?: {
    executions?: number;
    storage?: number;
    bandwidth?: number;
    users?: number;
  };
}

export interface PricingTier {
  name: string;
  price: number;
  interval?: "month" | "year";
  features: string[];
  limits: {
    executions?: number;
    storage?: number;
    bandwidth?: number;
    users?: number;
  };
  popular?: boolean;
}

// Execution Context
export interface ExecutionContext {
  id: string;
  appId: string;
  userId: string;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  logs: LogEntry[];
  metrics: ExecutionMetrics;
  cost: ExecutionCost;
  error?: ExecutionError;
  sandbox: SandboxConfig;
}

export type ExecutionStatus = 
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "timeout";

export interface LogEntry {
  timestamp: Date;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

export interface ExecutionMetrics {
  cpuTime: number; // milliseconds
  memoryPeak: number; // bytes
  memoryAverage: number; // bytes
  networkIn: number; // bytes
  networkOut: number; // bytes
  diskRead: number; // bytes
  diskWrite: number; // bytes
  apiCalls: number;
  dbQueries: number;
}

export interface ExecutionCost {
  compute: number;
  storage: number;
  bandwidth: number;
  apis: number;
  total: number;
  currency: string;
}

export interface ExecutionError {
  code: string;
  message: string;
  stack?: string;
  component?: string;
  recoverable: boolean;
  suggestions?: string[];
}

export interface SandboxConfig {
  runtime: "node" | "deno" | "python" | "browser";
  version: string;
  limits: {
    cpuTime: number; // milliseconds
    memory: number; // bytes
    diskSpace: number; // bytes
    networkBandwidth: number; // bytes/second
    executionTime: number; // milliseconds
    processes: number;
    fileDescriptors: number;
  };
  permissions: {
    network: {
      allowed: boolean;
      allowlist: string[];
    };
    filesystem: {
      read: string[];
      write: string[];
    };
    environment: {
      variables: string[];
    };
    apis: {
      allowed: string[];
    };
  };
}

// AI Generation Context
export interface GenerationRequest {
  prompt: string;
  context?: {
    existingApp?: App;
    userPreferences?: AppUserPreferences;
    constraints?: GenerationConstraints;
  };
  options?: {
    includeTests?: boolean;
    includeDocumentation?: boolean;
    optimizePerformance?: boolean;
    targetComplexity?: "simple" | "moderate" | "complex";
  };
}

export interface GenerationConstraints {
  maxComponents?: number;
  allowedTypes?: ComponentType[];
  theme?: Partial<Theme>;
  layout?: LayoutType;
  budget?: {
    development: number;
    monthly: number;
  };
  timeline?: number; // days
  compliance?: ("gdpr" | "hipaa" | "sox" | "pci")[];
}

export interface AppUserPreferences {
  favoriteThemes: Theme["palette"][];
  preferredLayouts: LayoutType[];
  defaultComponents: ComponentType[];
  codeStyle?: {
    indentation: "spaces" | "tabs";
    quotes: "single" | "double";
    semicolons: boolean;
    trailingCommas: boolean;
  };
  accessibility?: {
    contrast: "normal" | "high";
    motion: "full" | "reduced";
    screenReader: boolean;
  };
}

export interface IntentAnalysis {
  primaryGoal: string;
  functionalRequirements: string[];
  dataRequirements: {
    inputs: InputSchema[];
    outputs: OutputSchema[];
    storage?: DatabaseTable[];
  };
  integrations: Integration[];
  uiComponents: ComponentType[];
  nonFunctionalRequirements: {
    performance: PerformanceRequirement;
    security: SecurityRequirement;
    compliance: string[];
    accessibility: AccessibilityRequirement;
  };
  estimatedComplexity: "simple" | "moderate" | "complex";
  estimatedCost: {
    development: number;
    monthly: number;
  };
  confidence: number; // 0-1
  suggestions: string[];
}

export interface Integration {
  type: "api" | "database" | "service" | "webhook";
  name: string;
  provider?: string;
  config: Record<string, unknown>;
  auth?: {
    type: "none" | "api-key" | "oauth" | "basic";
    config?: Record<string, unknown>;
  };
}

export interface PerformanceRequirement {
  maxResponseTime: number; // milliseconds
  maxMemoryUsage: number; // bytes
  concurrentUsers: number;
  throughput: number; // requests/second
}

export interface SecurityRequirement {
  authentication: boolean;
  authorization: boolean;
  encryption: boolean;
  inputValidation: boolean;
  outputSanitization: boolean;
  auditLogging: boolean;
}

export interface AccessibilityRequirement {
  wcagLevel: "A" | "AA" | "AAA";
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorContrast: boolean;
  altText: boolean;
  focusManagement: boolean;
}