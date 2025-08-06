import Link from "next/link";
import { Button } from "@/components/ui/button";
import DarkVeil from "../Backgrounds/DarkVeil/DarkVeil";

export default function NotFound() {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0">
        <DarkVeil />
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center text-white max-w-md mx-auto px-6">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-gray-300 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
