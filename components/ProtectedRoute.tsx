"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store/store";
import DarkVeil from "../Backgrounds/DarkVeil/DarkVeil";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowUnauthenticated?: boolean; // For pages like download that don't require auth
}

export default function ProtectedRoute({
  children,
  allowUnauthenticated = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state.user.user);
  const loading = useAppSelector((state: RootState) => state.user.loading);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading during hydration or auth check
  if (!isMounted || loading) {
    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0">
          <DarkVeil />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center text-white max-w-md mx-auto px-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If page allows unauthenticated access, show children
  if (allowUnauthenticated) {
    return <>{children}</>;
  }

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0">
          <DarkVeil />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center text-white max-w-md mx-auto px-6">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-300 mb-6">
              Please log in to access this page.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}
