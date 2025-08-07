"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/userSlice";
import { onAuthStateChange, handleRedirectResult } from "@/utils/firebase";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Handle redirect result first (for mobile/redirect auth)
        console.log("🔐 Initializing auth provider...");

        // Check if we're likely coming from a redirect
        const urlParams = new URLSearchParams(window.location.search);
        const hasAuthParams =
          urlParams.has("code") ||
          urlParams.has("state") ||
          window.location.hash.includes("access_token");

        if (hasAuthParams) {
          console.log("🔐 Detected potential auth redirect parameters");
        }

        const redirectUser = await handleRedirectResult();

        if (redirectUser) {
          console.log("🔐 Redirect user found:", redirectUser.email);
          dispatch(setUser(redirectUser));

          // Show success message for mobile users
          import("sonner").then(({ toast }) => {
            toast.success("Successfully signed in!");
          });
        } else {
          console.log(
            "🔐 No redirect user found, continuing with auth state listener"
          );
        }
      } catch (error) {
        console.error("🔐 Error handling redirect result:", error);
        // Don't dispatch error for redirect result failures as they're often expected
        // Continue with normal auth state listener
      }
    };

    // Add a longer delay for mobile devices to ensure proper initialization
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const delay = isMobile ? 500 : 100;
    console.log(
      `🔐 Using ${delay}ms delay for auth initialization (mobile: ${isMobile})`
    );

    const timer = setTimeout(() => {
      initializeAuth();
    }, delay);

    // Set up auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      console.log("🔐 Auth state changed:", user ? user.email : "No user");
      dispatch(setUser(user));
    });

    return () => {
      console.log("🔐 Cleaning up auth listener");
      clearTimeout(timer);
      unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}
