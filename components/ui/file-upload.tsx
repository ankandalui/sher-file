import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  maxSize = 200 * 1024 * 1024, // 200MB default
}: {
  onChange?: (files: File[]) => void;
  maxSize?: number;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileChange = (newFiles: File[]) => {
    console.log("📂 handleFileChange called with:", {
      filesCount: newFiles.length,
      files: newFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        sizeMB: (f.size / (1024 * 1024)).toFixed(2),
      })),
      maxSizeMB: (maxSize / (1024 * 1024)).toFixed(2),
      timestamp: new Date().toISOString(),
    });

    // Filter files that exceed size limit
    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        console.error(`❌ File ${file.name} exceeds size limit:`, {
          fileSize: file.size,
          maxSize,
          fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
          maxSizeMB: (maxSize / (1024 * 1024)).toFixed(2),
        });
        return false;
      }
      console.log(`✅ File ${file.name} passed size validation`);
      return true;
    });

    console.log("📂 File validation results:", {
      totalFiles: newFiles.length,
      validFiles: validFiles.length,
      invalidFiles: newFiles.length - validFiles.length,
    });

    setFiles((prevFiles) => {
      const newFileList = [...prevFiles, ...validFiles];
      console.log("📂 Updated file list:", {
        previousCount: prevFiles.length,
        newValidFiles: validFiles.length,
        totalFiles: newFileList.length,
      });
      return newFileList;
    });

    if (onChange) {
      console.log(
        "📂 Calling onChange callback with valid files:",
        validFiles.length
      );
      try {
        onChange(validFiles);
        console.log("✅ onChange callback completed successfully");
      } catch (error) {
        console.error("❌ Error in onChange callback:", error);
      }
    } else {
      console.warn("⚠️ No onChange callback provided");
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    maxSize: maxSize,
    onDrop: (acceptedFiles, rejectedFiles) => {
      console.log("📥 Dropzone onDrop called:", {
        acceptedFiles: acceptedFiles.length,
        rejectedFiles: rejectedFiles.length,
        timestamp: new Date().toISOString(),
      });

      if (acceptedFiles.length > 0) {
        console.log(
          "✅ Accepted files:",
          acceptedFiles.map((f) => ({ name: f.name, size: f.size }))
        );
        handleFileChange(acceptedFiles);
      }

      if (rejectedFiles.length > 0) {
        console.warn(
          "⚠️ Rejected files:",
          rejectedFiles.map((f) => ({
            name: f.file.name,
            size: f.file.size,
            errors: f.errors.map((e) => e.code),
          }))
        );
      }
    },
    onDropRejected: (rejectedFiles) => {
      console.error("❌ Dropzone onDropRejected called:", {
        rejectedFilesCount: rejectedFiles.length,
        timestamp: new Date().toISOString(),
      });

      rejectedFiles.forEach(({ file, errors }) => {
        console.error("❌ Rejected file details:", {
          fileName: file.name,
          fileSize: file.size,
          fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
          errors: errors.map((e) => ({ code: e.code, message: e.message })),
        });

        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            console.error(`❌ File ${file.name} is too large:`, {
              fileSize: file.size,
              maxSize,
              fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
              maxSizeMB: (maxSize / (1024 * 1024)).toFixed(2),
            });
          } else if (error.code === "file-invalid-type") {
            console.error(`❌ File ${file.name} has invalid type:`, file.type);
          } else {
            console.error(`❌ File ${file.name} error:`, error);
          }
        });
      });
    },
    onDragEnter: () => {
      console.log("🖱️ Drag enter");
    },
    onDragLeave: () => {
      console.log("🖱️ Drag leave");
    },
    onDragOver: () => {
      console.log("🖱️ Drag over");
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files || []);
            console.log("📁 File input onChange:", {
              filesSelected: selectedFiles.length,
              files: selectedFiles.map((f) => ({ name: f.name, size: f.size })),
              timestamp: new Date().toISOString(),
            });
            handleFileChange(selectedFiles);
          }}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          {isMounted && <GridPattern />}
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            Upload file
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
            Drag or drop your files here or click to upload
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                    "shadow-sm"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 "
                    >
                      {file.type}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      modified{" "}
                      {isMounted
                        ? new Date(file.lastModified).toLocaleDateString()
                        : "..."}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
