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
        const redirectUser = await handleRedirectResult();

        if (redirectUser) {
          console.log("🔐 Redirect user found:", redirectUser.email);
          dispatch(setUser(redirectUser));
        }
      } catch (error) {
        console.error("🔐 Error handling redirect result:", error);
        // Don't dispatch error for redirect result failures as they're often expected
      }
    };

    initializeAuth();

    // Set up auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      console.log("🔐 Auth state changed:", user ? user.email : "No user");
      dispatch(setUser(user));
    });

    return () => {
      console.log("🔐 Cleaning up auth listener");
      unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}
