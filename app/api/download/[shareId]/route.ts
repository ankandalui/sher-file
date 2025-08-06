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
  { params }: { params: { shareId: string } }
) {
  try {
    console.log("🔍 Download request for shareId:", params.shareId);

    const fileData = await getFileByShareId(params.shareId);

    if (!fileData) {
      console.log("❌ File not found for shareId:", params.shareId);
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
