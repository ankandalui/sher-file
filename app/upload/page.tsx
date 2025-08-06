"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Copy,
  Upload,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadFileToStorage } from "@/utils/firebase";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import QRCode from "qrcode";
import DarkVeil from "../../Backgrounds/DarkVeil/DarkVeil";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function UploadPage() {
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state.user.user);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareableLink, setShareableLink] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");

  const handleFileUpload = async (files: File[]) => {
    console.log("🎯 handleFileUpload called with:", {
      filesCount: files.length,
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      timestamp: new Date().toISOString(),
    });

    if (!files.length) {
      console.warn("⚠️ No files selected");
      toast.error("Please select a file");
      return;
    }

    console.log("👤 User from Redux:", {
      user: user
        ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          }
        : null,
      userExists: !!user,
    });

    if (!user) {
      console.error("❌ User not authenticated");
      toast.error("Please make sure you're logged in");
      return;
    }

    if (!user.uid) {
      console.error("❌ User UID missing");
      toast.error("User authentication error - missing UID");
      return;
    }

    const file = files[0];
    const maxSize = 200 * 1024 * 1024; // 200MB in bytes

    console.log("📁 File validation:", {
      fileName: file.name,
      fileSize: file.size,
      maxSize,
      exceedsLimit: file.size > maxSize,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
    });

    if (file.size > maxSize) {
      console.error("❌ File too large:", {
        fileSize: file.size,
        maxSize,
        fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      });
      toast.error("File size must be less than 200MB");
      return;
    }

    try {
      console.log("⬆️ Starting upload process...");
      setUploading(true);
      setUploadProgress(0);
      setCurrentFileName(file.name);

      console.log("🚀 Calling uploadFileToStorage with:", {
        fileName: file.name,
        userId: user.uid,
        fileSize: file.size,
        hasProgressCallback: true,
      });

      const { downloadURL, shareId } = await uploadFileToStorage(
        file,
        user.uid,
        (progress: number) => {
          console.log("📊 Progress callback received:", {
            progress,
            timestamp: new Date().toISOString(),
          });
          setUploadProgress(progress);
        }
      );

      console.log("✅ Upload completed successfully:", {
        shareId,
        downloadURLLength: downloadURL?.length,
        hasDownloadURL: !!downloadURL,
      });

      // Generate shareable link
      const shareableURL = `${
        window.location.origin
      }/download/${shareId}?filename=${encodeURIComponent(file.name)}`;

      console.log("🔗 Generated shareable URL:", {
        shareableURL,
        shareId,
        origin: window.location.origin,
      });

      setShareableLink(shareableURL);

      // Generate QR code
      try {
        console.log("📱 Generating QR code...");
        const qrCode = await QRCode.toDataURL(shareableURL, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        console.log("📱 QR code generated successfully");
        setQrCodeDataURL(qrCode);
      } catch (qrError) {
        console.error("❌ Error generating QR code:", qrError);
      }

      setShowShareDialog(true);
      toast.success("File uploaded successfully!");
      console.log("🎉 Upload process completed successfully");
    } catch (error) {
      console.error("❌ Upload error:", {
        error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to upload file: ${errorMessage}`);
    } finally {
      console.log("🔄 Cleaning up upload state...");
      setUploading(false);
      setUploadProgress(0);
      setCurrentFileName("");
      console.log("✅ Upload state cleaned up");
    }
  };

  const cancelUpload = () => {
    setUploading(false);
    setUploadProgress(0);
    setCurrentFileName("");
    toast.info("Upload cancelled");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  // Clean up QR code when dialog closes
  useEffect(() => {
    if (!showShareDialog) {
      setQrCodeDataURL("");
    }
  }, [showShareDialog]);

  // Debug user state
  useEffect(() => {
    console.log("👤 User state changed:", {
      user: user
        ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }
        : null,
      userExists: !!user,
      timestamp: new Date().toISOString(),
    });
  }, [user]);

  // Check network connectivity
  useEffect(() => {
    const checkNetworkConnectivity = () => {
      console.log("🌐 Network connectivity check:", {
        online: navigator.onLine,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    };

    checkNetworkConnectivity();

    const handleOnline = () => {
      console.log("🌐 Network came online");
      checkNetworkConnectivity();
    };

    const handleOffline = () => {
      console.log("🌐 Network went offline");
      checkNetworkConnectivity();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen relative">
          {/* DarkVeil Background */}
          <div className="absolute inset-0">
            <DarkVeil />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white font-poppins">
                  Upload & Share
                </h1>
                <p className="text-blue-300 text-sm mt-1">
                  Secure file sharing made simple
                </p>
              </div>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Features Banner */}
            <div className="max-w-6xl mx-auto px-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 text-center">
                  <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Secure</h3>
                  <p className="text-gray-300 text-sm">
                    End-to-end encrypted storage
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 text-center">
                  <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Fast</h3>
                  <p className="text-gray-300 text-sm">
                    Lightning-quick uploads
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 text-center">
                  <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Global</h3>
                  <p className="text-gray-300 text-sm">
                    Share worldwide instantly
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="max-w-4xl mx-auto px-6">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl">
                {!uploading ? (
                  // Show upload interface when not uploading
                  <>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Upload Your File
                      </h2>
                      <p className="text-gray-300">
                        Share files up to 200MB with anyone, anywhere
                      </p>
                    </div>
                    <FileUpload onChange={handleFileUpload} />
                  </>
                ) : (
                  // Show upload progress when uploading
                  <div className="text-center">
                    <div className="space-y-6">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Upload className="w-8 h-8 text-white" />
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-white mb-2">
                          Uploading Your File
                        </h2>
                        <p className="text-blue-300 truncate max-w-md mx-auto">
                          {currentFileName}
                        </p>
                      </div>

                      <div className="max-w-md mx-auto">
                        <div className="flex items-center justify-between text-white text-sm mb-2">
                          <span>Progress</span>
                          <span className="text-blue-400 font-bold">
                            {Math.round(uploadProgress)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700/30 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-12 pb-8">
              <p className="text-gray-400 text-sm">
                Files are stored securely and can be shared with a simple link
              </p>
            </div>
          </div>

          {/* Share Dialog */}
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share Your File
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <p className="text-sm text-gray-600">
                  Your file has been uploaded successfully! Share this link with
                  anyone to let them download it. No login required for
                  downloading.
                </p>

                {/* QR Code */}
                {qrCodeDataURL && (
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Scan QR Code to Download
                    </p>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <img
                        src={qrCodeDataURL}
                        alt="QR Code for download link"
                        className="w-40 h-40"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Scan with your phone's camera to open the download link
                    </p>
                  </div>
                )}

                {/* Copy Link */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Or copy the link:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareableLink}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    />
                    <Button onClick={copyToClipboard} size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowShareDialog(false)}
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
