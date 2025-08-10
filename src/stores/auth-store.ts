import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User, AuthSession } from "@/types/user";

interface AuthState {
  // State
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: "google" | "github" | "microsoft") => Promise<void>;
  register: (email: string, password: string, profile: Partial<User["profile"]>) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (profile: Partial<User["profile"]>) => Promise<void>;
  updateSettings: (settings: Partial<User["settings"]>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  enableTwoFactor: () => Promise<string>; // returns backup codes
  disableTwoFactor: (code: string) => Promise<void>;
  
  // Internal
  setUser: (user: User | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
}

// Mock API calls - replace with actual API integration
const authApi = {
  login: async (email: string, _password: string): Promise<{ user: User; session: AuthSession }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    const mockUser: User = {
      id: "user-1",
      email,
      profile: {
        displayName: email.split("@")[0] || "User",
        firstName: "Test",
        lastName: "User",
        avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${email}`,
      },
      settings: {
        theme: "dark",
        language: "en",
        notifications: {
          email: { enabled: true, frequency: "daily", types: {
            appUpdates: true,
            collaborationInvites: true,
            marketplaceNews: false,
            securityAlerts: true,
            billingAlerts: true,
            systemMaintenance: true,
          }},
          push: { enabled: true, types: {
            executionComplete: true,
            collaboratorJoined: true,
            appPublished: true,
            errorAlerts: true,
          }},
          inApp: { enabled: true, sound: true, types: {
            mentions: true,
            comments: true,
            approvals: true,
          }},
        },
        privacy: {
          profileVisibility: "public",
          showActivity: true,
          showStats: true,
          allowIndexing: true,
          dataRetention: 0,
          analyticsOptOut: false,
          marketingOptOut: false,
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          screenReaderOptimized: false,
          fontSize: "medium",
          keyboardNavigation: true,
        },
        editor: {
          theme: "dark",
          fontSize: 14,
          fontFamily: "JetBrains Mono",
          tabSize: 2,
          wordWrap: true,
          lineNumbers: true,
          minimap: true,
          autoSave: "afterDelay",
          autoSaveDelay: 1000,
          formatOnSave: true,
          codeCompletion: true,
          shortcuts: {},
        },
        billing: {
          currency: "USD",
          autoRenewal: true,
        },
      },
      subscription: {
        id: "sub-1",
        tier: "free",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        usage: {
          period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date(),
          },
          apps: 2,
          executions: 45,
          storageUsed: 1024 * 1024 * 100, // 100MB
          bandwidthUsed: 1024 * 1024 * 500, // 500MB
          apiCalls: 120,
          collaborators: 1,
          costs: {
            compute: 0,
            storage: 0,
            bandwidth: 0,
            apis: 0,
            total: 0,
          },
        },
        limits: {
          apps: 3,
          executionsPerMonth: 1000,
          storageGB: 1,
          bandwidthGB: 5,
          teamMembers: 1,
          apiCallsPerMonth: 1000,
          collaborators: 3,
          privateApps: false,
          customDomain: false,
          prioritySupport: false,
          sla: "99%",
          dataRetentionDays: 30,
        },
        addOns: [],
        billing: {
          amount: 0,
          currency: "USD",
          interval: "month",
        },
      },
      preferences: {
        favoriteThemes: ["indigo", "violet"],
        preferredLayouts: ["dashboard", "two-column"],
        defaultComponents: ["card", "button", "input"],
        codeStyle: {
          indentation: "spaces",
          quotes: "double",
          semicolons: true,
          trailingCommas: true,
        },
        accessibility: {
          contrast: "normal",
          motion: "full",
          screenReader: false,
        },
        aiAssistant: {
          enabled: true,
          model: "gpt-4",
          creativity: 0.7,
          verbosity: "detailed",
          autoSuggest: true,
        },
      },
      stats: {
        appsCreated: 5,
        appsPublished: 2,
        totalExecutions: 156,
        totalRevenue: 0,
        averageRating: 4.2,
        totalDownloads: 23,
        followerCount: 8,
        followingCount: 12,
        contributionStreak: 7,
        joinDate: new Date("2024-01-15"),
        lastActive: new Date(),
        achievements: [],
        badges: [],
      },
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date(),
      emailVerified: true,
      twoFactorEnabled: false,
      status: "active",
    };
    
    const mockSession: AuthSession = {
      user: mockUser,
      token: "mock-jwt-token",
      refreshToken: "mock-refresh-token",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    };
    
    return { user: mockUser, session: mockSession };
  },
  
  register: async (email: string, password: string, profile: Partial<User["profile"]>): Promise<{ user: User; session: AuthSession }> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return authApi.login(email, password); // For now, just return login result
  },
  
  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  
  refreshToken: async (refreshToken: string): Promise<AuthSession> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    throw new Error("Token refresh not implemented");
  },
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,

        // Actions
        login: async (email: string, password: string) => {
          set({ isLoading: true });
          try {
            const { user, session } = await authApi.login(email, password);
            set({ 
              user, 
              session, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        loginWithProvider: async (provider) => {
          set({ isLoading: true });
          try {
            // Simulate OAuth flow
            await new Promise(resolve => setTimeout(resolve, 1500));
            const { user, session } = await authApi.login(`user@${provider}.com`, "password");
            set({ 
              user, 
              session, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        register: async (email, password, profile) => {
          set({ isLoading: true });
          try {
            const { user, session } = await authApi.register(email, password, profile);
            set({ 
              user, 
              session, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            await authApi.logout();
            set({ 
              user: null, 
              session: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          } catch (error) {
            // Force logout even if API fails
            set({ 
              user: null, 
              session: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        },

        refreshToken: async () => {
          const { session } = get();
          if (!session?.refreshToken) return;
          
          try {
            const newSession = await authApi.refreshToken(session.refreshToken);
            set({ session: newSession });
          } catch (error) {
            // If refresh fails, logout user
            get().logout();
          }
        },

        updateProfile: async (profile) => {
          const { user } = get();
          if (!user) return;
          
          set({ isLoading: true });
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const updatedUser: User = {
              ...user,
              profile: { ...user.profile, ...profile },
              updatedAt: new Date(),
            };
            
            set({ user: updatedUser, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        updateSettings: async (settings) => {
          const { user } = get();
          if (!user) return;
          
          set({ isLoading: true });
          try {
            await new Promise(resolve => setTimeout(resolve, 600));
            
            const updatedUser: User = {
              ...user,
              settings: { ...user.settings, ...settings },
              updatedAt: new Date(),
            };
            
            set({ user: updatedUser, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        resetPassword: async (email) => {
          set({ isLoading: true });
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        verifyEmail: async (token) => {
          set({ isLoading: true });
          try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const { user } = get();
            if (user) {
              set({ 
                user: { ...user, emailVerified: true, updatedAt: new Date() },
                isLoading: false 
              });
            }
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        enableTwoFactor: async () => {
          const { user } = get();
          if (!user) throw new Error("User not authenticated");
          
          set({ isLoading: true });
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const backupCodes = [
              "12345-67890",
              "09876-54321", 
              "11111-22222",
              "33333-44444",
              "55555-66666"
            ];
            
            set({ 
              user: { ...user, twoFactorEnabled: true, updatedAt: new Date() },
              isLoading: false 
            });
            
            return backupCodes.join("\n");
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        disableTwoFactor: async (code) => {
          const { user } = get();
          if (!user) throw new Error("User not authenticated");
          
          set({ isLoading: true });
          try {
            await new Promise(resolve => setTimeout(resolve, 800));
            set({ 
              user: { ...user, twoFactorEnabled: false, updatedAt: new Date() },
              isLoading: false 
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        // Internal setters
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setSession: (session) => set({ session }),
        setLoading: (isLoading) => set({ isLoading }),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          session: state.session,
          isAuthenticated: state.isAuthenticated,
        }),
        version: 1,
      }
    ),
    { name: "auth-store" }
  )
);