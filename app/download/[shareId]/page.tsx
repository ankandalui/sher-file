"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Download,
  Upload,
  ArrowRight,
  Mail,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFileByShareId } from "@/utils/firebase";
import { toast } from "sonner";
import DarkVeil from "../../../Backgrounds/DarkVeil/DarkVeil";
import ProtectedRoute from "@/components/ProtectedRoute";

interface FileData {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  downloadURL?: string;
  uploadedAt: Date | { seconds: number; nanoseconds: number };
}

export default function DownloadPage() {
  const router = useRouter();
  const params = useParams();
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const shareId = params.shareId as string;

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        console.log("🔍 Fetching file data for shareId:", shareId);
        const data = await getFileByShareId(shareId);
        if (data) {
          setFileData(data as FileData);
        } else {
          console.log("❌ File not found for shareId:", shareId);
          setFileData(null);
        }
      } catch (error) {
        console.error("❌ Error fetching file:", error);
        toast.error("File not found");
        setFileData(null);
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchFileData();
    }
  }, [shareId]);

  const handleDownload = async () => {
    if (!fileData) return;

    try {
      setDownloading(true);
      console.log("⬇️ Starting download for file:", fileData.filename);

      // Use the API route for downloads
      const downloadUrl = `/api/download/${shareId}`;

      console.log("🔗 Download URL:", downloadUrl);

      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileData.filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started!");
      console.log("✅ Download initiated successfully");
    } catch (error) {
      console.error("❌ Download error:", error);
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  // Social sharing functions
  const shareToWhatsApp = () => {
    const currentUrl = window.location.href;
    const message = `📁 File shared with you!\n\n📄 ${fileData?.filename}\n🔗 ${currentUrl}\n\nDownload your file securely with Sharer.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp...");
  };

  const shareToEmail = () => {
    const currentUrl = window.location.href;
    const subject = "File shared with you";
    const body = `Hello!

I've shared a file with you using Sharer.

File: ${fileData?.filename}
Download link: ${currentUrl}

You can download the file securely using the link above.

Best regards`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    toast.success("Opening email client...");
  };

  const shareToOutlook = () => {
    const currentUrl = window.location.href;
    const subject = "File shared with you";
    const body = `Hello!

I've shared a file with you using Sharer.

File: ${fileData?.filename}
Download link: ${currentUrl}

You can download the file securely using the link above.

Best regards`;
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(outlookUrl, "_blank");
    toast.success("Opening Outlook...");
  };

  const shareToTelegram = () => {
    const currentUrl = window.location.href;
    const message = `📁 File shared with you!\n\n📄 ${fileData?.filename}\n🔗 ${currentUrl}\n\nDownload your file securely with Sharer.`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
      currentUrl
    )}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, "_blank");
    toast.success("Opening Telegram...");
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0">
          <DarkVeil />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0">
          <DarkVeil />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center text-white max-w-md mx-auto px-6">
            <h1 className="text-2xl font-bold mb-4">File Not Found</h1>
            <p className="text-gray-300 mb-6">
              The file you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowUnauthenticated={true}>
      <div className="min-h-screen relative">
        <div className="absolute inset-0">
          <DarkVeil />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Main Content */}
          <div className="max-w-2xl mx-auto">
            {/* File Download Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download className="w-8 h-8 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                  Download File
                </h1>
                <p className="text-gray-300 mb-6">
                  Someone shared this file with you
                </p>

                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {fileData.filename}
                  </h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>File type: {fileData.type || "Unknown"}</p>
                    <p>Size: {(fileData.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>

                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  size="lg"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg mb-4"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download File
                    </>
                  )}
                </Button>

                {/* Social Sharing */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-300 text-center">
                    Share this file:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={shareToWhatsApp}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-green-400 border-green-400/20 hover:bg-green-400/10"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                    <Button
                      onClick={shareToEmail}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-blue-400 border-blue-400/20 hover:bg-blue-400/10"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                    <Button
                      onClick={shareToOutlook}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-purple-400 border-purple-400/20 hover:bg-purple-400/10"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Outlook
                    </Button>
                    <Button
                      onClick={shareToTelegram}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-blue-400 border-blue-400/20 hover:bg-blue-400/10"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Telegram
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* App Advertisement */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-white" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2">
                  Share Your Files Too!
                </h2>
                <p className="text-gray-300 mb-4">
                  Upload and share files securely with Sharer. Fast, reliable,
                  and easy to use.
                </p>

                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Try Sharer <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
