import { NextRequest, NextResponse } from "next/server";
import { getFileByShareId } from "@/utils/firebase";

interface FileData {
  id: string;
  filename: string;
  size: number;
  type: string;
  downloadURL: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  try {
    console.log("🔍 Download request for shareId:", shareId);

    const fileData = await getFileByShareId(shareId);

    if (!fileData) {
      console.log("❌ File not found for shareId:", shareId);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = fileData as FileData;
    console.log("✅ File found:", {
      filename: file.filename,
      size: file.size,
      type: file.type,
    });

    // Redirect to Firebase Storage URL
    if (file.downloadURL) {
      console.log("📦 Redirecting to Firebase Storage URL");
      return NextResponse.redirect(file.downloadURL);
    }

    console.error("❌ No download URL found");
    return NextResponse.json(
      { error: "Download URL not found" },
      { status: 500 }
    );
  } catch (error) {
    console.error("❌ Error in download API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
