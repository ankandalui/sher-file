import { Metadata } from "next";
import { getFileByShareId } from "@/utils/firebase";

interface DownloadLayoutProps {
  children: React.ReactNode;
  params: { shareId: string };
}

interface FileData {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  downloadURL?: string;
  uploadedAt: Date | { seconds: number; nanoseconds: number };
}

export async function generateMetadata({
  params,
}: DownloadLayoutProps): Promise<Metadata> {
  try {
    const fileData = await getFileByShareId(params.shareId);

    if (!fileData) {
      return {
        title: "File Not Found - Sharer",
        description: "The requested file could not be found.",
      };
    }

    const file = fileData as FileData;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    return {
      title: `${file.filename} - Shared via Sharer`,
      description: `Download ${file.filename} (${fileSizeMB} MB) securely with Sharer. Fast, reliable file sharing.`,
      openGraph: {
        title: `${file.filename} - Shared via Sharer`,
        description: `Download ${file.filename} (${fileSizeMB} MB) securely with Sharer. Fast, reliable file sharing.`,
        type: "website",
        url: `https://sher-file.vercel.app/download/${params.shareId}`,
        siteName: "Sharer",
        images: [
          {
            url: "/og-image.png",
            width: 1200,
            height: 630,
            alt: `File: ${file.filename}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${file.filename} - Shared via Sharer`,
        description: `Download ${file.filename} (${fileSizeMB} MB) securely with Sharer.`,
        images: ["/og-image.png"],
      },
    };
  } catch {
    return {
      title: "File Download - Sharer",
      description: "Download your file securely with Sharer.",
    };
  }
}

export default function DownloadLayout({ children }: DownloadLayoutProps) {
  return <>{children}</>;
}
