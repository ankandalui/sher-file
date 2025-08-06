"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DarkVeil from "../Backgrounds/DarkVeil/DarkVeil";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "./LoginDialog";
import { ProfileDropdown } from "./ProfileDropdown";
import { onAuthStateChange } from "@/utils/firebase";
import { setUser, setLoading } from "@/store/userSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store/store";

export default function HeroSection() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state.user.user);
  const loading = useAppSelector((state: RootState) => state.user.loading);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChange((user) => {
      dispatch(setUser(user));
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className="min-h-screen relative">
      {/* Profile Dropdown - Positioned in top-right corner */}
      <div className="absolute top-4 right-4 z-50">
        <ProfileDropdown />
      </div>

      {/* Hero Section with DarkVeil Background */}
      <div className="relative w-full h-screen">
        <DarkVeil />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto w-full">
            <div className="relative">
              <h1 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-8 leading-tight">
                Share files across the world
                <br />
                <span className="relative">
                  With <span className="text-blue-400">Sharer</span>
                </span>
              </h1>
            </div>

            <p className="font-poppins text-base sm:text-lg md:text-xl lg:text-2xl mb-12 text-white max-w-4xl mx-auto leading-relaxed">
              Secure, fast, and reliable file sharing for everyone
            </p>

            {isMounted ? (
              user ? (
                // Logged in - Show Upload File button
                <Button
                  onClick={() => router.push("/upload")}
                  size="lg"
                  className="font-poppins font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-lg"
                >
                  Upload File
                </Button>
              ) : (
                // Not logged in - Show Get Started button with login dialog
                <LoginDialog>
                  <Button
                    size="lg"
                    className="font-poppins font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto bg-white hover:bg-gray-100 text-black border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-lg"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Get Started"}
                  </Button>
                </LoginDialog>
              )
            ) : (
              // Initial loading state to prevent hydration mismatch
              <Button
                size="lg"
                className="font-poppins font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto bg-white hover:bg-gray-100 text-black border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-lg"
                disabled
              >
                Loading...
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
