"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutUser } from "@/utils/firebase";
import { clearUser } from "@/store/userSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store/store";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user.user);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      dispatch(clearUser());
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user || !isMounted) return null;

  return (
    <div className="absolute top-4 right-4 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 p-0 overflow-hidden"
          >
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || "Profile"}
                width={48}
                height={48}
                className="rounded-full object-cover w-full h-full"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.displayName && (
                <p className="font-medium">{user.displayName}</p>
              )}
              {user.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={handleSignOut}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
