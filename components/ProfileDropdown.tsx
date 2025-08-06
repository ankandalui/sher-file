"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, RefreshCw } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store/store";
import { signOutUser, clearAuthState } from "@/utils/firebase";
import { toast } from "sonner";

export function ProfileDropdown() {
  const user = useAppSelector((state: RootState) => state.user.user);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Debug logging
  console.log("🔍 ProfileDropdown - User data:", {
    user: user
      ? {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          hasPhotoURL: !!user.photoURL,
        }
      : null,
  });

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOutUser();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    try {
      setIsLoading(true);
      await clearAuthState();
      toast.success("Authentication cleared. Please sign in again.");
      // Reload the page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error("Error clearing auth state:", error);
      toast.error("Failed to clear authentication");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300"
          disabled={isLoading}
        >
          {user.photoURL && !imageError ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || user.email || "User"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
              unoptimized
              onError={() => {
                console.log("❌ Image failed to load:", user.photoURL);
                setImageError(true);
              }}
              onLoad={() => {
                console.log("✅ Image loaded successfully:", user.photoURL);
              }}
            />
          ) : (
            <User className="h-4 w-4 text-gray-600" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSwitchAccount} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Switch Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
