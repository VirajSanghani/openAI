export interface User {
  id: string;
  email: string;
  username?: string;
  profile: UserProfile;
  settings: UserSettings;
  subscription: Subscription;
  organization?: Organization;
  preferences: UserPreferences;
  stats: UserStats;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  emailVerified: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled: boolean;
  status: "active" | "inactive" | "suspended" | "deleted";
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  timezone?: string;
  company?: string;
  jobTitle?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  editor: EditorSettings;
  billing: BillingSettings;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: "immediate" | "daily" | "weekly" | "never";
    types: {
      appUpdates: boolean;
      collaborationInvites: boolean;
      marketplaceNews: boolean;
      securityAlerts: boolean;
      billingAlerts: boolean;
      systemMaintenance: boolean;
    };
  };
  push: {
    enabled: boolean;
    types: {
      executionComplete: boolean;
      collaboratorJoined: boolean;
      appPublished: boolean;
      errorAlerts: boolean;
    };
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    types: {
      mentions: boolean;
      comments: boolean;
      approvals: boolean;
    };
  };
}

export interface PrivacySettings {
  profileVisibility: "public" | "organization" | "private";
  showActivity: boolean;
  showStats: boolean;
  allowIndexing: boolean;
  dataRetention: number; // days, 0 = forever
  analyticsOptOut: boolean;
  marketingOptOut: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  fontSize: "small" | "medium" | "large" | "extra-large";
  keyboardNavigation: boolean;
}

export interface EditorSettings {
  theme: "light" | "dark" | "auto";
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  autoSave: "off" | "afterDelay" | "onFocusChange";
  autoSaveDelay: number; // milliseconds
  formatOnSave: boolean;
  codeCompletion: boolean;
  shortcuts: Record<string, string>;
}

export interface BillingSettings {
  defaultPaymentMethod?: PaymentMethod;
  billingAddress?: Address;
  taxId?: string;
  invoiceEmail?: string;
  currency: string;
  autoRenewal: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "paypal" | "crypto";
  brand?: string;
  last4?: string;
  expiry?: string;
  default: boolean;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: "active" | "inactive" | "cancelled" | "past_due" | "unpaid";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  usage: UsageMetrics;
  limits: SubscriptionLimits;
  addOns: AddOn[];
  billing: {
    amount: number;
    currency: string;
    interval: "month" | "year";
    nextPayment?: Date;
    paymentMethod?: PaymentMethod;
  };
}

export type SubscriptionTier = "free" | "starter" | "professional" | "business" | "enterprise";

export interface SubscriptionLimits {
  apps: number;
  executionsPerMonth: number;
  storageGB: number;
  bandwidthGB: number;
  teamMembers: number;
  apiCallsPerMonth: number;
  collaborators: number;
  privateApps: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
  sla: string;
  dataRetentionDays: number;
}

export interface UsageMetrics {
  period: {
    start: Date;
    end: Date;
  };
  apps: number;
  executions: number;
  storageUsed: number; // bytes
  bandwidthUsed: number; // bytes
  apiCalls: number;
  collaborators: number;
  costs: {
    compute: number;
    storage: number;
    bandwidth: number;
    apis: number;
    total: number;
  };
}

export interface AddOn {
  id: string;
  name: string;
  type: "storage" | "executions" | "bandwidth" | "team-members" | "priority-support";
  quantity: number;
  price: number;
  currency: string;
  interval: "month" | "year" | "one-time";
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo?: string;
  industry?: string;
  size?: "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";
  members: OrganizationMember[];
  settings: OrganizationSettings;
  subscription: Subscription;
  limits: OrganizationLimits;
  billing: OrganizationBilling;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  user: User;
  role: OrganizationRole;
  permissions: Permission[];
  invitedBy: User;
  invitedAt: Date;
  joinedAt?: Date;
  status: "invited" | "active" | "inactive" | "suspended";
}

export type OrganizationRole = "owner" | "admin" | "member" | "viewer" | "billing";

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, unknown>;
}

export interface OrganizationSettings {
  visibility: "public" | "private";
  allowMemberInvites: boolean;
  requireApproval: boolean;
  sso: SSOConfig;
  security: SecurityPolicy;
  branding: BrandingConfig;
  domains: string[];
}

export interface SSOConfig {
  enabled: boolean;
  provider?: "google" | "microsoft" | "okta" | "auth0" | "saml";
  config?: Record<string, unknown>;
  enforced: boolean; // require SSO for all members
  allowedDomains: string[];
}

export interface SecurityPolicy {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge: number; // days
    historyCount: number;
  };
  mfaRequired: boolean;
  sessionTimeout: number; // minutes
  ipWhitelist: string[];
  allowedCountries: string[];
  auditLogRetention: number; // days
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  favicon: string;
  customDomain?: string;
  customCSS?: string;
  emailTemplate?: string;
}

export interface OrganizationLimits extends SubscriptionLimits {
  // Additional org-specific limits
  projects: number;
  departments: number;
  roles: number;
  policies: number;
}

export interface OrganizationBilling {
  plan: string;
  seats: number;
  usage: UsageMetrics;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  billingContact: User;
  purchaseOrders: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  date: Date;
  dueDate: Date;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  items: InvoiceItem[];
  payments: Payment[];
  downloadUrl: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  period?: {
    start: Date;
    end: Date;
  };
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  date: Date;
  status: "pending" | "succeeded" | "failed" | "cancelled";
  refunded?: boolean;
}

export interface UserStats {
  appsCreated: number;
  appsPublished: number;
  totalExecutions: number;
  totalRevenue: number;
  averageRating: number;
  totalDownloads: number;
  followerCount: number;
  followingCount: number;
  contributionStreak: number;
  joinDate: Date;
  lastActive: Date;
  achievements: Achievement[];
  badges: Badge[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: "creation" | "collaboration" | "community" | "technical" | "business";
  rarity: "common" | "uncommon" | "rare" | "legendary";
  progress?: {
    current: number;
    target: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  issuedAt: Date;
  issuedBy?: User | Organization;
  expires?: Date;
  verifiable: boolean;
}

// User Preferences (from app.ts for consistency)
export interface UserPreferences {
  favoriteThemes: ("indigo" | "violet" | "mint" | "sunrise" | "rose")[];
  preferredLayouts: ("single" | "two-column" | "three-column" | "dashboard" | "grid" | "flex")[];
  defaultComponents: string[];
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
  aiAssistant?: {
    enabled: boolean;
    model: string;
    creativity: number; // 0-1
    verbosity: "concise" | "detailed" | "verbose";
    autoSuggest: boolean;
  };
}

// Session and Auth
export interface AuthSession {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  device?: DeviceInfo;
  location?: LocationInfo;
}

export interface DeviceInfo {
  type: "desktop" | "mobile" | "tablet";
  os: string;
  browser: string;
  userAgent: string;
}

export interface LocationInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
}

// API Keys and Tokens
export interface APIKey {
  id: string;
  name: string;
  key: string; // hashed
  permissions: string[];
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
  revokedAt?: Date;
  usage: {
    requests: number;
    lastRequest?: Date;
  };
}

// Audit and Activity
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ip: string;
  userAgent: string;
  timestamp: Date;
  severity: "info" | "warn" | "error" | "critical";
}