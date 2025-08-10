import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type { 
  App, 
  AppManifest, 
  Component, 
  Theme, 
  ExecutionContext,
  GenerationRequest,
  IntentAnalysis
} from "@/types/app";

interface AppState {
  // Current app being edited
  currentApp: App | null;
  currentManifest: AppManifest | null;
  
  // App creation/editing state
  isGenerating: boolean;
  generationProgress: number;
  lastGeneration: IntentAnalysis | null;
  
  // Component editing
  selectedComponents: string[];
  clipboardComponents: Component[];
  
  // Execution state
  executions: ExecutionContext[];
  activeExecution: string | null;
  
  // History and undo/redo
  history: AppManifest[];
  historyIndex: number;
  maxHistorySize: number;
  
  // Actions - App Management
  createApp: (request: GenerationRequest) => Promise<App>;
  loadApp: (appId: string) => Promise<void>;
  saveApp: () => Promise<void>;
  forkApp: (appId: string) => Promise<App>;
  deleteApp: (appId: string) => Promise<void>;
  
  // Actions - Manifest Editing  
  updateManifest: (updates: Partial<AppManifest>) => void;
  updateTheme: (theme: Partial<Theme>) => void;
  updateMetadata: (metadata: Partial<AppManifest['metadata']>) => void;
  
  // Actions - Component Management
  addComponent: (component: Component, index?: number) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  moveComponent: (id: string, targetIndex: number) => void;
  
  // Actions - Selection
  selectComponent: (id: string, multi?: boolean) => void;
  selectMultipleComponents: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Actions - Clipboard
  copyComponents: (ids: string[]) => void;
  cutComponents: (ids: string[]) => void;
  pasteComponents: (index?: number) => void;
  
  // Actions - History
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;
  clearHistory: () => void;
  
  // Actions - Execution
  executeApp: (inputs: Record<string, unknown>) => Promise<ExecutionContext>;
  getExecution: (id: string) => ExecutionContext | null;
  cancelExecution: (id: string) => Promise<void>;
  
  // Actions - AI Generation
  generateFromPrompt: (prompt: string) => Promise<void>;
  regenerateComponent: (componentId: string, prompt: string) => Promise<void>;
  
  // Internal actions
  setCurrentApp: (app: App | null) => void;
  setGenerating: (isGenerating: boolean, progress?: number) => void;
}

// Mock data
const createMockApp = (): App => ({
  id: "app-1",
  manifest: {
    version: "1.0",
    metadata: {
      name: "My New App",
      description: "A powerful application built with Casual OS",
      author: "Current User",
      license: "MIT",
      tags: ["productivity", "dashboard"],
      category: "productivity",
      icon: "📊",
    },
    inputs: [],
    outputs: [],
    components: [
      {
        id: "comp-1",
        type: "card",
        title: "Welcome",
        body: "Welcome to your new app! Click the edit button to start customizing.",
      } as Component,
    ],
    connections: [],
    layout: {
      type: "single",
    },
    theme: {
      palette: "indigo",
      radius: 18,
      blur: 16,
      density: 12,
      glass: 0.1,
    },
    configuration: {
      cors: { enabled: false, origins: [] },
      rateLimit: { enabled: false, requests: 100, window: 60 },
      authentication: { required: false, providers: [] },
    },
    requirements: {
      executionTime: 30000,
      memory: 512 * 1024 * 1024,
      cost: 0.01,
      storage: 100 * 1024 * 1024,
      bandwidth: 1024 * 1024 * 1024,
      apis: 1000,
    },
    permissions: {
      public: false,
      allowFork: true,
      allowCommercialUse: false,
    },
  },
  owner: {} as any, // Will be filled with actual user
  collaborators: [],
  visibility: "private",
  status: "draft",
  version: { major: 0, minor: 1, patch: 0 },
  versions: [],
  stats: {
    views: 0,
    installs: 0,
    executions: 0,
    forks: 0,
    likes: 0,
    rating: 0,
    reviews: 0,
    activeUsers: 0,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Mock API
const appApi = {
  generateApp: async (request: GenerationRequest): Promise<{ app: App; analysis: IntentAnalysis }> => {
    // Simulate AI generation process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const analysis: IntentAnalysis = {
      primaryGoal: "Create a productivity application",
      functionalRequirements: ["Data input", "Data visualization", "User interaction"],
      dataRequirements: {
        inputs: [
          {
            id: "input-1",
            name: "userInput",
            type: "string",
            description: "User text input",
            required: true,
          }
        ],
        outputs: [
          {
            id: "output-1", 
            name: "result",
            type: "string",
            description: "Processed result",
          }
        ],
      },
      integrations: [],
      uiComponents: ["card", "input", "button"],
      nonFunctionalRequirements: {
        performance: {
          maxResponseTime: 1000,
          maxMemoryUsage: 100 * 1024 * 1024,
          concurrentUsers: 100,
          throughput: 10,
        },
        security: {
          authentication: false,
          authorization: false,
          encryption: false,
          inputValidation: true,
          outputSanitization: true,
          auditLogging: false,
        },
        compliance: [],
        accessibility: {
          wcagLevel: "AA",
          screenReader: true,
          keyboardNavigation: true,
          colorContrast: true,
          altText: true,
          focusManagement: true,
        },
      },
      estimatedComplexity: "simple",
      estimatedCost: {
        development: 100,
        monthly: 5,
      },
      confidence: 0.85,
      suggestions: ["Consider adding data visualization", "Add input validation"],
    };
    
    return { app: createMockApp(), analysis };
  },
  
  saveApp: async (app: App): Promise<App> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...app, updatedAt: new Date() };
  },
  
  executeApp: async (app: App, inputs: Record<string, unknown>): Promise<ExecutionContext> => {
    const execution: ExecutionContext = {
      id: `exec-${Date.now()}`,
      appId: app.id,
      userId: "user-1",
      inputs,
      status: "running",
      startedAt: new Date(),
      logs: [
        {
          timestamp: new Date(),
          level: "info",
          message: "Starting app execution...",
        }
      ],
      metrics: {
        cpuTime: 0,
        memoryPeak: 0,
        memoryAverage: 0,
        networkIn: 0,
        networkOut: 0,
        diskRead: 0,
        diskWrite: 0,
        apiCalls: 0,
        dbQueries: 0,
      },
      cost: {
        compute: 0,
        storage: 0,
        bandwidth: 0,
        apis: 0,
        total: 0,
        currency: "USD",
      },
      sandbox: {
        runtime: "node",
        version: "18.0.0",
        limits: {
          cpuTime: 5000,
          memory: 128 * 1024 * 1024,
          diskSpace: 50 * 1024 * 1024,
          networkBandwidth: 1024 * 1024,
          executionTime: 30000,
          processes: 1,
          fileDescriptors: 10,
        },
        permissions: {
          network: { allowed: false, allowlist: [] },
          filesystem: { read: [], write: [] },
          environment: { variables: [] },
          apis: { allowed: [] },
        },
      },
    };
    
    // Simulate execution
    setTimeout(() => {
      execution.status = "completed";
      execution.completedAt = new Date();
      execution.duration = 1500;
      execution.outputs = { result: "Mock execution result" };
      execution.logs.push({
        timestamp: new Date(),
        level: "info",
        message: "Execution completed successfully",
      });
    }, 1500);
    
    return execution;
  },
};

export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector(
      (set, get) => ({
        // Initial state
        currentApp: null,
        currentManifest: null,
        isGenerating: false,
        generationProgress: 0,
        lastGeneration: null,
        selectedComponents: [],
        clipboardComponents: [],
        executions: [],
        activeExecution: null,
        history: [],
        historyIndex: -1,
        maxHistorySize: 50,

        // App Management
        createApp: async (request) => {
          set({ isGenerating: true, generationProgress: 0 });
          
          try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
              set((state) => ({ 
                generationProgress: Math.min(state.generationProgress + 10, 90) 
              }));
            }, 300);
            
            const { app, analysis } = await appApi.generateApp(request);
            clearInterval(progressInterval);
            
            set({
              currentApp: app,
              currentManifest: app.manifest,
              isGenerating: false,
              generationProgress: 100,
              lastGeneration: analysis,
              history: [app.manifest],
              historyIndex: 0,
            });
            
            return app;
          } catch (error) {
            set({ isGenerating: false, generationProgress: 0 });
            throw error;
          }
        },

        loadApp: async (appId) => {
          // Mock loading app
          const app = createMockApp();
          app.id = appId;
          
          set({
            currentApp: app,
            currentManifest: app.manifest,
            history: [app.manifest],
            historyIndex: 0,
            selectedComponents: [],
          });
        },

        saveApp: async () => {
          const { currentApp } = get();
          if (!currentApp) return;
          
          const savedApp = await appApi.saveApp(currentApp);
          set({ currentApp: savedApp });
        },

        forkApp: async (appId) => {
          const originalApp = createMockApp(); // Mock getting original app
          const forkedApp: App = {
            ...originalApp,
            id: `app-${Date.now()}`,
            manifest: {
              ...originalApp.manifest,
              metadata: {
                ...originalApp.manifest.metadata,
                name: `${originalApp.manifest.metadata.name} (Fork)`,
              },
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set({
            currentApp: forkedApp,
            currentManifest: forkedApp.manifest,
            history: [forkedApp.manifest],
            historyIndex: 0,
          });
          
          return forkedApp;
        },

        deleteApp: async (appId) => {
          const { currentApp } = get();
          if (currentApp?.id === appId) {
            set({
              currentApp: null,
              currentManifest: null,
              history: [],
              historyIndex: -1,
              selectedComponents: [],
            });
          }
        },

        // Manifest Editing
        updateManifest: (updates) => {
          const { currentManifest } = get();
          if (!currentManifest) return;
          
          const updatedManifest = { ...currentManifest, ...updates };
          set({ currentManifest: updatedManifest });
          get().pushToHistory();
        },

        updateTheme: (theme) => {
          const { currentManifest } = get();
          if (!currentManifest) return;
          
          const updatedManifest = {
            ...currentManifest,
            theme: { ...currentManifest.theme, ...theme },
          };
          set({ currentManifest: updatedManifest });
          get().pushToHistory();
        },

        updateMetadata: (metadata) => {
          const { currentManifest } = get();
          if (!currentManifest) return;
          
          const updatedManifest = {
            ...currentManifest,
            metadata: { ...currentManifest.metadata, ...metadata },
          };
          set({ currentManifest: updatedManifest });
          get().pushToHistory();
        },

        // Component Management
        addComponent: (component, index) => {
          const { currentManifest } = get();
          if (!currentManifest) return;
          
          const components = [...currentManifest.components];
          const targetIndex = index ?? components.length;
          components.splice(targetIndex, 0, component);
          
          const updatedManifest = { ...currentManifest, components } as AppManifest;
          set({ currentManifest: updatedManifest });
          get().pushToHistory();
        },

        updateComponent: (id, updates) => {
          const { currentManifest } = get();
          if (!currentManifest) return;
          
          const components = currentManifest.components.map(comp =>
            comp.id === id ? { ...comp, ...updates } : comp
          );
          
          const updatedManifest = { ...currentManifest, components } as AppManifest;
          set({ currentManifest: updatedManifest });
          get().pushToHistory();
        },

        deleteComponent: (id) => {
          const { currentManifest, selectedComponents } = get();
          if (!currentManifest) return;
          
          const components = currentManifest.components.filter(comp => comp.id !== id);
          const updatedSelection = selectedComponents.filter(compId => compId !== id);
          
          const updatedManifest = { ...currentManifest, components };
          set({ 
            currentManifest: updatedManifest,
            selectedComponents: updatedSelection,
          });
          get().pushToHistory();
        },

        duplicateComponent: (id) => {
          const { currentManifest } = get();
          if (!currentManifest) return;
          
          const component = currentManifest.components.find(comp => comp.id === id);
          if (!component) return;
          
          const duplicatedComponent: Component = {
            ...component,
            id: `${component.id}-copy-${Date.now()}`,
          };
          
          const componentIndex = currentManifest.components.findIndex(comp => comp.id === id);
          get().addComponent(duplicatedComponent, componentIndex + 1);
        },

        moveComponent: (id, targetIndex) => {
          const { currentManifest } = get();
          if (!currentManifest) return;
          
          const components = [...currentManifest.components];
          const sourceIndex = components.findIndex(comp => comp.id === id);
          
          if (sourceIndex === -1) return;
          
          const [component] = components.splice(sourceIndex, 1);
          if (component) {
            components.splice(targetIndex, 0, component);
          }
          
          const updatedManifest = { ...currentManifest, components } as AppManifest;
          set({ currentManifest: updatedManifest });
          get().pushToHistory();
        },

        // Selection
        selectComponent: (id, multi = false) => {
          const { selectedComponents } = get();
          
          if (multi) {
            const newSelection = selectedComponents.includes(id)
              ? selectedComponents.filter(compId => compId !== id)
              : [...selectedComponents, id];
            set({ selectedComponents: newSelection });
          } else {
            set({ selectedComponents: [id] });
          }
        },

        selectMultipleComponents: (ids) => {
          set({ selectedComponents: ids });
        },

        clearSelection: () => {
          set({ selectedComponents: [] });
        },

        // Clipboard
        copyComponents: (ids) => {
          const { currentManifest } = get();
          if (!currentManifest) return;
          
          const components = currentManifest.components.filter(comp => ids.includes(comp.id));
          set({ clipboardComponents: components });
        },

        cutComponents: (ids) => {
          get().copyComponents(ids);
          ids.forEach(id => get().deleteComponent(id));
        },

        pasteComponents: (index) => {
          const { clipboardComponents, currentManifest } = get();
          if (!clipboardComponents.length || !currentManifest) return;
          
          const targetIndex = index ?? currentManifest.components.length;
          
          clipboardComponents.forEach((component, i) => {
            const pastedComponent: Component = {
              ...component,
              id: `${component.id}-paste-${Date.now()}-${i}`,
            };
            get().addComponent(pastedComponent, targetIndex + i);
          });
        },

        // History
        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            set({
              currentManifest: history[newIndex],
              historyIndex: newIndex,
            });
          }
        },

        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            set({
              currentManifest: history[newIndex],
              historyIndex: newIndex,
            });
          }
        },

        pushToHistory: () => {
          const { currentManifest, history, historyIndex, maxHistorySize } = get();
          if (!currentManifest) return;
          
          // Remove any history after current index (when undoing and making new changes)
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(currentManifest);
          
          // Limit history size
          if (newHistory.length > maxHistorySize) {
            newHistory.shift();
          } else {
            set({ historyIndex: historyIndex + 1 });
          }
          
          set({ history: newHistory });
        },

        clearHistory: () => {
          set({ history: [], historyIndex: -1 });
        },

        // Execution
        executeApp: async (inputs) => {
          const { currentApp } = get();
          if (!currentApp) throw new Error("No app to execute");
          
          const execution = await appApi.executeApp(currentApp, inputs);
          
          set((state) => ({
            executions: [...state.executions, execution],
            activeExecution: execution.id,
          }));
          
          return execution;
        },

        getExecution: (id) => {
          const { executions } = get();
          return executions.find(exec => exec.id === id) || null;
        },

        cancelExecution: async (id) => {
          set((state) => ({
            executions: state.executions.map(exec =>
              exec.id === id ? { ...exec, status: "cancelled" as const } : exec
            ),
            activeExecution: state.activeExecution === id ? null : state.activeExecution,
          }));
        },

        // AI Generation
        generateFromPrompt: async (prompt) => {
          const request: GenerationRequest = { prompt };
          await get().createApp(request);
        },

        regenerateComponent: async (componentId, prompt) => {
          // Mock regenerating a single component
          set({ isGenerating: true });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create a new mock component based on the prompt
            const newComponent: Component = {
              id: componentId,
              type: "card",
              title: "Regenerated Component",
              body: `Updated based on: "${prompt}"`,
            };
            
            get().updateComponent(componentId, newComponent);
            set({ isGenerating: false });
          } catch (error) {
            set({ isGenerating: false });
            throw error;
          }
        },

        // Internal setters
        setCurrentApp: (app) => {
          set({
            currentApp: app,
            currentManifest: app?.manifest || null,
            selectedComponents: [],
          });
        },

        setGenerating: (isGenerating, progress) => {
          set({ 
            isGenerating, 
            generationProgress: progress ?? (isGenerating ? 0 : 100) 
          });
        },
      })
    ),
    { name: "app-store" }
  )
);