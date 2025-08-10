import type { App, AppCategory, PricingModel } from "./app";
import type { User } from "./user";

// Marketplace Discovery
export interface MarketplaceApp extends App {
  marketplaceInfo: MarketplaceInfo;
  reviews: Review[];
  collections: Collection[];
}

export interface MarketplaceInfo {
  featured: boolean;
  trending: boolean;
  verified: boolean;
  staff_pick: boolean;
  publishedAt: Date;
  lastUpdated: Date;
  downloads: number;
  weeklyDownloads: number;
  rating: number;
  reviewCount: number;
  revenue: number;
  keywords: string[];
  alternativeApps: string[]; // app IDs
  relatedApps: string[]; // app IDs
  supportEmail?: string;
  documentationUrl?: string;
  demoUrl?: string;
  changelogUrl?: string;
}

export interface Review {
  id: string;
  user: User;
  app: App;
  rating: number; // 1-5
  title?: string;
  content: string;
  pros: string[];
  cons: string[];
  recommended: boolean;
  verified: boolean; // verified purchase/usage
  helpful: number; // helpful votes
  reported: number; // report count
  createdAt: Date;
  updatedAt?: Date;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  content: string;
  author: User; // app owner or developer
  createdAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  apps: App[];
  owner: User;
  visibility: "public" | "private" | "unlisted";
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  followersCount: number;
}

// Search and Filtering
export interface SearchFilters {
  query?: string;
  categories: AppCategory[];
  priceRange: {
    min: number;
    max: number;
  };
  pricing: ("free" | "paid" | "freemium" | "open-source")[];
  rating: number; // minimum rating
  features: string[];
  integrations: string[];
  verified: boolean;
  dateRange: {
    start: Date;
    end: Date;
  };
  sortBy: "relevance" | "popular" | "recent" | "rating" | "price" | "downloads";
  sortOrder: "asc" | "desc";
}

export interface SearchResult {
  apps: MarketplaceApp[];
  total: number;
  page: number;
  limit: number;
  filters: SearchFilters;
  suggestions: string[];
  facets: SearchFacets;
}

export interface SearchFacets {
  categories: FacetCount[];
  pricing: FacetCount[];
  ratings: FacetCount[];
  features: FacetCount[];
  authors: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
  selected: boolean;
}

// Installation and Usage
export interface Installation {
  id: string;
  user: User;
  app: App;
  version: string;
  installedAt: Date;
  lastUsed?: Date;
  configuration: Record<string, unknown>;
  customization: Record<string, unknown>;
  permissions: string[];
  autoUpdate: boolean;
  status: "active" | "inactive" | "error" | "updating";
  usage: InstallationUsage;
}

export interface InstallationUsage {
  executions: number;
  lastExecution?: Date;
  avgExecutionTime: number;
  errors: number;
  lastError?: Date;
  dataUsage: number; // bytes
  storageUsage: number; // bytes
}

// Publishing and Management
export interface PublishingRequest {
  app: App;
  version: string;
  changelog: string;
  reviewNotes?: string;
  screenshots: string[];
  documentation?: string;
  testingInstructions?: string;
  targetAudience: string[];
  supportChannels: SupportChannel[];
}

export interface SupportChannel {
  type: "email" | "chat" | "forum" | "documentation" | "video";
  url: string;
  availability?: string;
  language?: string;
}

export interface PublishingReview {
  id: string;
  app: App;
  version: string;
  reviewer: User;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  checklist: ReviewChecklist;
  feedback: ReviewFeedback[];
  createdAt: Date;
  completedAt?: Date;
  estimatedCompletionTime?: Date;
}

export interface ReviewChecklist {
  functionality: boolean;
  security: boolean;
  performance: boolean;
  documentation: boolean;
  compliance: boolean;
  accessibility: boolean;
  userExperience: boolean;
  codeQuality: boolean;
}

export interface ReviewFeedback {
  category: "security" | "performance" | "functionality" | "design" | "compliance";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  suggestion?: string;
  resolved: boolean;
}

// Revenue and Analytics
export interface RevenueAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  total: number;
  breakdown: {
    subscriptions: number;
    oneTime: number;
    usage: number;
    tips: number;
  };
  transactions: Transaction[];
  projections: RevenueProjection[];
  conversionFunnel: ConversionStep[];
}

export interface Transaction {
  id: string;
  type: "purchase" | "subscription" | "refund" | "chargeback" | "tip";
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  user: User;
  app: App;
  paymentMethod: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
  completedAt?: Date;
  refundReason?: string;
}

export interface RevenueProjection {
  period: string;
  projected: number;
  confidence: number; // 0-1
  factors: string[];
}

export interface ConversionStep {
  step: "view" | "preview" | "install" | "purchase" | "activate" | "retain";
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface AppAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  overview: {
    views: number;
    uniqueVisitors: number;
    downloads: number;
    activeUsers: number;
    revenue: number;
    rating: number;
  };
  traffic: TrafficMetrics;
  usage: UsageMetrics;
  performance: PerformanceMetrics;
  errors: ErrorMetrics;
  feedback: FeedbackMetrics;
}

export interface TrafficMetrics {
  sources: TrafficSource[];
  geography: GeographyData[];
  devices: DeviceData[];
  referrers: ReferrerData[];
  searchTerms: SearchTermData[];
}

export interface TrafficSource {
  source: string;
  visits: number;
  uniqueVisitors: number;
  conversionRate: number;
}

export interface GeographyData {
  country: string;
  users: number;
  revenue: number;
  avgSessionDuration: number;
}

export interface DeviceData {
  type: "desktop" | "mobile" | "tablet";
  os: string;
  browser: string;
  users: number;
  sessions: number;
}

export interface ReferrerData {
  domain: string;
  visits: number;
  conversionRate: number;
}

export interface SearchTermData {
  term: string;
  searches: number;
  clicks: number;
  position: number;
}

export interface UsageMetrics {
  sessions: SessionData[];
  features: FeatureUsage[];
  workflows: WorkflowData[];
  retention: RetentionData;
}

export interface SessionData {
  date: Date;
  sessions: number;
  avgDuration: number;
  bounceRate: number;
  newUsers: number;
}

export interface FeatureUsage {
  feature: string;
  usage: number;
  uniqueUsers: number;
  avgTimeSpent: number;
}

export interface WorkflowData {
  workflow: string;
  completions: number;
  avgTime: number;
  dropOffPoint?: string;
}

export interface RetentionData {
  day1: number;
  day7: number;
  day30: number;
  day90: number;
  cohorts: CohortData[];
}

export interface CohortData {
  period: string;
  users: number;
  retention: number[];
}

export interface PerformanceMetrics {
  loadTime: number;
  executionTime: number;
  errorRate: number;
  uptime: number;
  throughput: number;
  memory: number;
  cpu: number;
}

export interface ErrorMetrics {
  total: number;
  byType: ErrorTypeData[];
  byComponent: ErrorComponentData[];
  topErrors: TopErrorData[];
}

export interface ErrorTypeData {
  type: string;
  count: number;
  affectedUsers: number;
}

export interface ErrorComponentData {
  component: string;
  errors: number;
  affectedSessions: number;
}

export interface TopErrorData {
  message: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  affectedUsers: number;
}

export interface FeedbackMetrics {
  rating: number;
  reviews: number;
  sentiment: "positive" | "neutral" | "negative";
  topComplaints: string[];
  topPraises: string[];
  featureRequests: FeatureRequest[];
}

export interface FeatureRequest {
  feature: string;
  votes: number;
  comments: number;
  status: "open" | "planned" | "in-progress" | "completed" | "rejected";
}

// Community and Social Features
export interface AppComment {
  id: string;
  user: User;
  app: App;
  content: string;
  parentId?: string; // for replies
  likes: number;
  dislikes: number;
  reported: boolean;
  createdAt: Date;
  updatedAt?: Date;
  replies?: AppComment[];
}

export interface AppLike {
  id: string;
  user: User;
  app: App;
  createdAt: Date;
}

export interface AppFollow {
  id: string;
  user: User;
  app: App;
  notifications: boolean;
  createdAt: Date;
}

export interface UserFollow {
  id: string;
  follower: User;
  following: User;
  createdAt: Date;
}

// Featured Content
export interface FeaturedContent {
  id: string;
  type: "app" | "collection" | "developer" | "tutorial" | "news";
  title: string;
  description: string;
  image: string;
  url: string;
  priority: number;
  startDate: Date;
  endDate?: Date;
  targetAudience?: string[];
  impressions: number;
  clicks: number;
  ctr: number;
}

// Marketplace Configuration
export interface MarketplaceConfig {
  commission: number; // percentage
  listingFee: number;
  featuredPlacementFee: number;
  reviewModeration: boolean;
  autoApproval: boolean;
  categories: CategoryConfig[];
  paymentMethods: string[];
  currencies: string[];
  regions: RegionConfig[];
  compliance: ComplianceConfig;
}

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  parent?: string;
  featured: boolean;
  requirements?: string[];
}

export interface RegionConfig {
  region: string;
  currency: string;
  taxRate: number;
  paymentMethods: string[];
  restricted: boolean;
  compliance: string[];
}

export interface ComplianceConfig {
  gdpr: boolean;
  ccpa: boolean;
  coppa: boolean;
  appStoreGuidelines: boolean;
  customRules: ComplianceRule[];
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  autoCheck: boolean;
  checkScript?: string;
}