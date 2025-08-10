"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { Provider as JotaiProvider } from "jotai";
import { SessionProvider } from "@/components/auth/session-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error instanceof Error && 'status' in error) {
                const status = error.status as number;
                if (status >= 400 && status < 500) return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={true}
        disableTransitionOnChange={false}
        themes={["light", "dark"]}
      >
        <QueryClientProvider client={queryClient}>
          <JotaiProvider>
            {children}
            <ReactQueryDevtools 
              initialIsOpen={false} 
            />
            <Toaster richColors position="top-right" />
          </JotaiProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}