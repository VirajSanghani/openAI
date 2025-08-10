import type { App, Component } from "./app";
import type { User } from "./user";

// Real-time Collaboration
export interface CollaborationSession {
  id: string;
  app: App;
  participants: SessionParticipant[];
  status: "active" | "paused" | "ended";
  startedAt: Date;
  endedAt?: Date;
  lastActivity: Date;
  settings: SessionSettings;
  permissions: SessionPermissions;
}

export interface SessionParticipant {
  user: User;
  role: "host" | "editor" | "viewer";
  joinedAt: Date;
  lastActive: Date;
  cursor?: CursorPosition;
  selection?: Selection;
  status: "active" | "idle" | "away" | "disconnected";
  permissions: string[];
}

export interface CursorPosition {
  componentId?: string;
  x: number;
  y: number;
  color: string;
  label: string;
}

export interface Selection {
  componentIds: string[];
  startPosition?: Position;
  endPosition?: Position;
}

export interface Position {
  componentId: string;
  offset: number;
}

export interface SessionSettings {
  allowAnonymous: boolean;
  maxParticipants: number;
  autoSave: boolean;
  autoSaveInterval: number; // seconds
  voiceChat: boolean;
  videoChat: boolean;
  screenSharing: boolean;
  recording: boolean;
  publicLink: boolean;
  expiresAt?: Date;
}

export interface SessionPermissions {
  canInvite: string[]; // role names
  canEdit: string[];
  canView: string[];
  canComment: string[];
  canDelete: string[];
  canManagePermissions: string[];
}

// Real-time Events
export interface CollaborationEvent {
  id: string;
  type: CollaborationEventType;
  sessionId: string;
  userId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  acknowledged?: string[]; // user IDs who acknowledged
}

export type CollaborationEventType =
  | "user_joined"
  | "user_left"
  | "cursor_moved"
  | "component_added"
  | "component_updated"
  | "component_deleted"
  | "selection_changed"
  | "comment_added"
  | "comment_updated"
  | "comment_deleted"
  | "permission_changed"
  | "app_saved"
  | "conflict_detected"
  | "conflict_resolved"
  | "voice_started"
  | "voice_ended"
  | "screen_shared"
  | "screen_stopped";

// Conflict Resolution
export interface Conflict {
  id: string;
  type: "concurrent_edit" | "delete_modified" | "dependency_conflict";
  componentId: string;
  participants: string[]; // user IDs
  changes: ConflictChange[];
  status: "detected" | "resolving" | "resolved" | "escalated";
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: ConflictResolution;
}

export interface ConflictChange {
  userId: string;
  operation: "create" | "update" | "delete";
  component: Component;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface ConflictResolution {
  type: "manual" | "automatic" | "merge";
  resolvedBy: string; // user ID
  strategy: "accept_all" | "reject_all" | "custom";
  mergedComponent?: Component;
  notes?: string;
}

// Comments and Feedback
export interface Comment {
  id: string;
  type: "general" | "suggestion" | "issue" | "question" | "approval";
  content: string;
  author: User;
  target: CommentTarget;
  status: "open" | "resolved" | "archived";
  priority: "low" | "medium" | "high";
  assignee?: User;
  mentions: User[];
  attachments: Attachment[];
  reactions: Reaction[];
  replies: CommentReply[];
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
  dueDate?: Date;
}

export interface CommentTarget {
  type: "app" | "component" | "connection" | "general";
  id?: string; // component/connection ID
  position?: {
    x: number;
    y: number;
  };
}

export interface CommentReply {
  id: string;
  content: string;
  author: User;
  mentions: User[];
  reactions: Reaction[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Reaction {
  emoji: string;
  users: User[];
  count: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: User;
  uploadedAt: Date;
}

// Team Management
export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  owner: User;
  members: TeamMember[];
  projects: Project[];
  settings: TeamSettings;
  subscription?: TeamSubscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  user: User;
  role: TeamRole;
  permissions: TeamPermission[];
  invitedBy: User;
  invitedAt: Date;
  joinedAt?: Date;
  status: "invited" | "active" | "inactive" | "suspended";
  lastActive?: Date;
}

export type TeamRole = "owner" | "admin" | "lead" | "developer" | "designer" | "viewer";

export interface TeamPermission {
  resource: "app" | "project" | "team" | "billing";
  actions: string[]; // create, read, update, delete, share, etc.
  conditions?: Record<string, unknown>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  apps: App[];
  members: ProjectMember[];
  status: "planning" | "active" | "paused" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export interface ProjectMember {
  user: User;
  role: "lead" | "contributor" | "reviewer";
  permissions: string[];
  assignedTasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: "development" | "design" | "review" | "testing" | "documentation";
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "review" | "done" | "cancelled";
  assignee?: User;
  reporter: User;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[]; // task IDs
  comments: Comment[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamSettings {
  visibility: "public" | "private";
  allowMemberInvites: boolean;
  requireApproval: boolean;
  defaultRole: TeamRole;
  notifications: TeamNotificationSettings;
  integrations: TeamIntegration[];
}

export interface TeamNotificationSettings {
  appUpdates: boolean;
  comments: boolean;
  mentions: boolean;
  collaborationRequests: boolean;
  deadlineReminders: boolean;
}

export interface TeamIntegration {
  type: "slack" | "discord" | "teams" | "github" | "jira" | "trello";
  config: Record<string, unknown>;
  enabled: boolean;
  events: string[];
}

export interface TeamSubscription {
  plan: "free" | "team" | "business" | "enterprise";
  seats: number;
  billing: {
    amount: number;
    currency: string;
    interval: "month" | "year";
  };
  features: string[];
  limits: {
    projects: number;
    apps: number;
    storage: number;
    collaborators: number;
  };
}

// Version Control
export interface Version {
  id: string;
  number: string;
  app: App;
  author: User;
  message: string;
  changes: Change[];
  parent?: string; // parent version ID
  branches: string[];
  tags: string[];
  createdAt: Date;
  stats: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

export interface Change {
  type: "create" | "update" | "delete" | "move";
  componentId: string;
  before?: Component;
  after?: Component;
  metadata: Record<string, unknown>;
}

export interface Branch {
  id: string;
  name: string;
  app: App;
  head: string; // version ID
  author: User;
  description?: string;
  status: "active" | "merged" | "abandoned";
  protected: boolean;
  mergeRequests: MergeRequest[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MergeRequest {
  id: string;
  title: string;
  description?: string;
  sourceBranch: Branch;
  targetBranch: Branch;
  author: User;
  reviewers: User[];
  status: "open" | "merged" | "closed" | "draft";
  conflicts: Conflict[];
  reviews: MergeReview[];
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  mergedBy?: User;
}

export interface MergeReview {
  id: string;
  reviewer: User;
  status: "approved" | "changes_requested" | "commented";
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

// Activity and History
export interface Activity {
  id: string;
  type: ActivityType;
  actor: User;
  target: ActivityTarget;
  metadata: Record<string, unknown>;
  timestamp: Date;
  visibility: "public" | "team" | "private";
}

export type ActivityType =
  | "app_created"
  | "app_updated"
  | "app_published"
  | "app_forked"
  | "comment_added"
  | "collaboration_started"
  | "collaboration_ended"
  | "team_joined"
  | "team_left"
  | "review_submitted"
  | "merge_completed"
  | "conflict_resolved";

export interface ActivityTarget {
  type: "app" | "comment" | "team" | "user" | "merge_request";
  id: string;
  name?: string;
  url?: string;
}

export interface ActivityFeed {
  activities: Activity[];
  filters: ActivityFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ActivityFilters {
  types: ActivityType[];
  actors: string[]; // user IDs
  dateRange: {
    start: Date;
    end: Date;
  };
  teams: string[]; // team IDs
  apps: string[]; // app IDs
}

// Notifications
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  user: User;
  actor?: User;
  target: NotificationTarget;
  data: Record<string, unknown>;
  status: "unread" | "read" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  channels: NotificationChannel[];
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export type NotificationType =
  | "mention"
  | "comment"
  | "collaboration_invite"
  | "team_invite"
  | "app_shared"
  | "review_requested"
  | "merge_conflict"
  | "deadline_reminder"
  | "system_update"
  | "security_alert"
  | "billing_alert";

export interface NotificationTarget {
  type: "app" | "comment" | "team" | "collaboration" | "merge_request" | "system";
  id: string;
  url?: string;
}

export type NotificationChannel = "in_app" | "email" | "push" | "sms" | "slack" | "webhook";

// Workspace and Environment
export interface Workspace {
  id: string;
  name: string;
  type: "personal" | "team" | "organization";
  owner: User;
  members: WorkspaceMember[];
  apps: App[];
  settings: WorkspaceSettings;
  usage: WorkspaceUsage;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  user: User;
  role: "admin" | "member" | "guest";
  permissions: string[];
  joinedAt: Date;
  lastActive: Date;
}

export interface WorkspaceSettings {
  defaultPermissions: Record<string, string[]>;
  integrations: WorkspaceIntegration[];
  branding: WorkspaceBranding;
  security: WorkspaceSecurity;
}

export interface WorkspaceIntegration {
  type: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface WorkspaceBranding {
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  customDomain?: string;
}

export interface WorkspaceSecurity {
  ssoRequired: boolean;
  ipWhitelist: string[];
  mfaRequired: boolean;
  sessionTimeout: number;
}

export interface WorkspaceUsage {
  period: {
    start: Date;
    end: Date;
  };
  apps: number;
  members: number;
  executions: number;
  storage: number;
  bandwidth: number;
  collaborationSessions: number;
  limits: {
    apps: number;
    members: number;
    storage: number;
    executions: number;
  };
}