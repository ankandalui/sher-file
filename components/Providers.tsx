"use client";

import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}
