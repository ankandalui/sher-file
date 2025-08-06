"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setUser, setLoading, setError } from "@/store/userSlice";
import { onAuthStateChange, handleRedirectResult } from "@/utils/firebase";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("🔐 Initializing auth provider...");

    // Handle redirect result first (for mobile/redirect auth)
    const checkRedirectResult = async () => {
      try {
        await handleRedirectResult();
      } catch (error) {
        console.error("🔐 Redirect result error:", error);
        // Don't dispatch error for redirect result failures as they're often expected
      }
    };

    checkRedirectResult();

    // Set up auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      console.log(
        "🔐 Auth state listener triggered:",
        user?.email || "No user"
      );
      dispatch(setUser(user));
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("🔐 Cleaning up auth listener");
      unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}
