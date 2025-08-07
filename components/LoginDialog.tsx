"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signInWithGoogle } from "@/utils/firebase";
import { setUser, setLoading, setError } from "@/store/userSlice";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "sonner";
import { MobileLoginButton } from "@/components/MobileLoginButton";

interface LoginDialogProps {
  children: React.ReactNode;
}

export function LoginDialog({ children }: LoginDialogProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(""));
      console.log("🔐 LoginDialog: Starting Google sign-in...");

      // Check if we're on mobile
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        console.log("🔐 Mobile device detected - using redirect flow");
        // For mobile, close dialog immediately before redirect
        setOpen(false);
        toast.info("Redirecting to Google...");

        // Small delay to ensure dialog closes
        setTimeout(async () => {
          try {
            await signInWithGoogle();
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : "Sign-in failed";
            dispatch(setError(errorMessage));
            toast.error(errorMessage);
            dispatch(setLoading(false));
          }
        }, 300);
        return;
      }

      // Desktop flow
      const user = await signInWithGoogle();
      if (user) {
        dispatch(setUser(user));
        setOpen(false);
        toast.success("Successfully signed in!");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign-in failed";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      dispatch(setLoading(false));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to Sharer</DialogTitle>
          <DialogDescription>
            Choose your preferred sign in method to continue to Sharer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {isMobile ? (
            <MobileLoginButton />
          ) : (
            <Button
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-black hover:bg-gray-100 border border-gray-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
