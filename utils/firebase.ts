import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { checkEnvironmentVariables } from "./env-check";

// Check environment variables in development
if (process.env.NODE_ENV === "development") {
  checkEnvironmentVariables();
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debug: Log Firebase configuration (without API key for security)
console.log("Firebase Configuration Debug:", {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
});

// Validate required config
const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "appId",
];
const missingKeys = requiredKeys.filter(
  (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
);
if (missingKeys.length > 0) {
  console.error("❌ Missing Firebase environment variables:", missingKeys);
  console.error("Make sure these are set in your .env.local file:");
  missingKeys.forEach((key) => {
    console.error(`NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}=your_${key}_here`);
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Debug: Log Firebase services initialization
console.log("Firebase Services Debug:", {
  authInitialized: !!auth,
  dbInitialized: !!db,
  storageInitialized: !!storage,
  storageBucket: storage?.app?.options?.storageBucket,
});

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Detect if we're in a mobile browser or popup blocker environment
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const shouldUseRedirect = () => {
  if (typeof window === "undefined") return false;

  // Always use redirect on mobile
  if (isMobile()) {
    console.log("🔐 Mobile device detected, using redirect");
    return true;
  }

  // Use redirect for PWA/standalone apps
  if (
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true
  ) {
    console.log("🔐 PWA detected, using redirect");
    return true;
  }

  // Use redirect for smaller screens (mobile-like experience)
  if (window.innerWidth <= 768) {
    console.log("🔐 Small screen detected, using redirect");
    return true;
  }

  return false;
};

// Sign in with Google - with popup and redirect fallback
export const signInWithGoogle = async () => {
  try {
    console.log("🔐 Starting Google Sign-in...");
    console.log(
      "🔐 User agent:",
      typeof window !== "undefined" ? navigator.userAgent : "Server side"
    );
    console.log(
      "🔐 Screen width:",
      typeof window !== "undefined" ? window.innerWidth : "Server side"
    );
    console.log("🔐 Should use redirect:", shouldUseRedirect());

    let result;

    if (shouldUseRedirect()) {
      console.log("🔐 Using redirect method for mobile/PWA");
      await signInWithRedirect(auth, googleProvider);
      console.log("🔐 Redirect initiated - user will be redirected to Google");
      return null; // Redirect will handle the rest
    } else {
      console.log("🔐 Using popup method");
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError: unknown) {
        console.warn("🔐 Popup failed, trying redirect:", popupError);

        // If popup fails (blocked by popup blocker), fall back to redirect
        const error = popupError as { code?: string };
        if (
          error.code === "auth/popup-blocked" ||
          error.code === "auth/popup-closed-by-user" ||
          error.code === "auth/cancelled-popup-request"
        ) {
          console.log("🔐 Popup blocked, falling back to redirect");
          await signInWithRedirect(auth, googleProvider);
          return null;
        }
        throw popupError;
      }
    }

    if (result && result.user) {
      console.log("🔐 Google Sign-in successful:", result.user.email);
      // Create or update user document in Firestore
      await createOrUpdateUserDocument(result.user);
      return result.user;
    }

    return null;
  } catch (error: unknown) {
    const authError = error as { code?: string; message?: string };
    console.error("🔐 Error signing in with Google:", {
      code: authError.code,
      message: authError.message,
      details: error,
    });

    // Provide user-friendly error messages
    let userMessage = "Failed to sign in with Google";

    switch (authError.code) {
      case "auth/popup-blocked":
        userMessage = "Popup was blocked. Please allow popups and try again.";
        break;
      case "auth/popup-closed-by-user":
        userMessage = "Sign-in was cancelled.";
        break;
      case "auth/network-request-failed":
        userMessage = "Network error. Please check your connection.";
        break;
      case "auth/internal-error":
        userMessage = "Internal error. Please try again.";
        break;
      case "auth/unauthorized-domain":
        userMessage = "This domain is not authorized. Please contact support.";
        break;
      case "auth/account-exists-with-different-credential":
        userMessage =
          "This account is already linked to another sign-in method.";
        break;
      case "auth/credential-already-in-use":
        userMessage =
          "This account is already in use. Please try a different account.";
        break;
    }

    const enhancedError = new Error(userMessage);
    (enhancedError as Error & { originalError?: unknown }).originalError =
      error;
    throw enhancedError;
  }
};

// Handle redirect result on app initialization
export const handleRedirectResult = async () => {
  try {
    console.log("🔐 Checking for redirect result...");
    const result = await getRedirectResult(auth);

    if (result && result.user) {
      console.log("🔐 Redirect sign-in successful:", result.user.email);
      await createOrUpdateUserDocument(result.user);
      return result.user;
    }

    console.log("🔐 No redirect result found");
    return null;
  } catch (error: unknown) {
    const authError = error as { code?: string; message?: string };
    console.error("🔐 Error handling redirect result:", {
      code: authError.code,
      message: authError.message,
      details: error,
    });

    // Handle specific mobile authentication errors
    switch (authError.code) {
      case "auth/account-exists-with-different-credential":
        console.log(
          "🔐 Account exists with different credential - user needs to link accounts"
        );
        // Don't throw error, just return null to let the user try again
        return null;
      case "auth/credential-already-in-use":
        console.log("🔐 Credential already in use - clearing auth state");
        await signOutUser();
        return null;
      case "auth/user-disabled":
        console.log("🔐 User account is disabled");
        break;
      case "auth/operation-not-allowed":
        console.log("🔐 Operation not allowed");
        break;
      case "auth/invalid-credential":
        console.log("🔐 Invalid credential");
        break;
      case "auth/popup-closed-by-user":
        console.log("🔐 Popup was closed by user");
        return null;
      case "auth/cancelled-popup-request":
        console.log("🔐 Popup request was cancelled");
        return null;
    }

    // For other errors, don't throw but return null to allow retry
    console.log("🔐 Returning null due to error, allowing retry");
    return null;
  }
};

// Create or update user document in Firestore
export const createOrUpdateUserDocument = async (user: User) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  try {
    const userDoc = await getDoc(userRef);

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastSignIn: new Date(),
    };

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
        totalUploads: 0,
      });
      console.log("New user document created:", user.uid);
    } else {
      // Update existing user document
      await setDoc(userRef, userData, { merge: true });
      console.log("User document updated:", user.uid);
    }
  } catch (error) {
    console.error("Error creating/updating user document:", error);
    // Don't throw error here to avoid blocking authentication
  }
};

// Update user's upload count
export const updateUserUploadCount = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentCount = userDoc.data().totalUploads || 0;
      await setDoc(
        userRef,
        {
          totalUploads: currentCount + 1,
          lastUpload: new Date(),
        },
        { merge: true }
      );
      console.log("User upload count updated:", userId);
    }
  } catch (error) {
    console.error("Error updating user upload count:", error);
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    console.log("🔐 Signing out user...");
    await signOut(auth);
    console.log("🔐 User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Clear authentication state (useful for mobile device switching)
export const clearAuthState = async () => {
  try {
    console.log("🔐 Clearing authentication state...");
    await signOut(auth);
    // Clear any stored auth data
    if (typeof window !== "undefined") {
      localStorage.removeItem("firebase:authUser:");
      sessionStorage.clear();
    }
    console.log("🔐 Authentication state cleared");
  } catch (error) {
    console.error("Error clearing auth state:", error);
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    console.log("🔐 Auth state changed:", user ? user.email : "No user");

    if (user) {
      // Ensure user document exists in Firestore
      await createOrUpdateUserDocument(user);
    }

    callback(user);
  });
};

// Upload file to Firebase Storage and metadata to Firestore
export const uploadFileToStorage = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ downloadURL: string; shareId: string }> => {
  console.log("🚀 uploadFileToStorage called with:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    userId,
    timestamp: new Date().toISOString(),
  });

  // Validate inputs
  if (!file) {
    const error = new Error("No file provided");
    console.error("❌ Upload error:", error);
    throw error;
  }

  if (!userId) {
    const error = new Error("No user ID provided");
    console.error("❌ Upload error:", error);
    throw error;
  }

  if (!storage) {
    const error = new Error("Firebase storage not initialized");
    console.error("❌ Upload error:", error);
    throw error;
  }

  const timestamp = Date.now();
  const shareId =
    Math.random().toString(36).substring(2, 15) + timestamp.toString(36);
  const filename = `${timestamp}_${file.name}`;
  const storagePath = `uploads/${userId}/${filename}`;

  console.log("📁 Creating storage reference:", {
    storagePath,
    shareId,
    filename,
    timestamp,
  });

  const storageRef = ref(storage, storagePath);

  console.log("📁 Storage ref created:", {
    bucket: storageRef.bucket,
    fullPath: storageRef.fullPath,
    name: storageRef.name,
  });

  return new Promise((resolve, reject) => {
    console.log("⬆️ Creating upload task...");
    const uploadTask = uploadBytesResumable(storageRef, file);

    console.log("⬆️ Upload task created, starting upload...");

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const state = snapshot.state;

        console.log("📊 Upload progress:", {
          progress: Math.round(progress * 100) / 100,
          state,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          timestamp: new Date().toISOString(),
        });

        // Validate progress callback
        if (typeof onProgress === "function") {
          try {
            onProgress(progress);
          } catch (progressError) {
            console.error("❌ Error in progress callback:", progressError);
          }
        } else {
          console.warn("⚠️ No progress callback provided or invalid callback");
        }
      },
      (error) => {
        console.error("❌ Upload error occurred:", {
          errorCode: error.code,
          errorMessage: error.message,
          errorName: error.name,
          customData: error.customData,
          serverResponse: error.serverResponse,
          timestamp: new Date().toISOString(),
        });

        // Log common error causes
        if (error.code === "storage/unauthorized") {
          console.error(
            "🔒 Storage unauthorized error - check Firebase rules and authentication"
          );
        } else if (error.code === "storage/canceled") {
          console.error("⏹️ Upload was canceled");
        } else if (error.code === "storage/unknown") {
          console.error("❓ Unknown storage error - check network connection");
        }

        reject(error);
      },
      async () => {
        console.log("✅ Upload completed successfully, processing...");
        try {
          console.log("🔗 Getting download URL...");
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("🔗 Download URL obtained:", {
            downloadURL: downloadURL.substring(0, 100) + "...", // Truncate for security
            urlLength: downloadURL.length,
          });

          console.log("💾 Saving metadata to Firestore...");
          const fileMetadata = {
            shareId,
            filename: file.name,
            originalName: file.name,
            size: file.size,
            type: file.type,
            downloadURL,
            uploadedBy: userId,
            uploadedAt: new Date(),
            storageRef: uploadTask.snapshot.ref.fullPath,
            storageType: "storage",
          };

          console.log("💾 File metadata to save:", {
            ...fileMetadata,
            downloadURL: downloadURL.substring(0, 50) + "...", // Truncate for log
          });

          const docRef = await addDoc(collection(db, "files"), fileMetadata);
          console.log("💾 Metadata saved with document ID:", docRef.id);

          // Update user's total uploads count
          console.log("👤 Updating user upload count...");
          await updateUserUploadCount(userId);
          console.log("👤 User upload count updated");

          console.log(
            "🎉 Upload process completed successfully, resolving promise"
          );
          resolve({ downloadURL, shareId });
        } catch (error) {
          console.error("❌ Error in completion handler:", {
            error,
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          });
          reject(error);
        }
      }
    );

    // Log upload task state after creation
    setTimeout(() => {
      console.log("📋 Upload task state after 1 second:", {
        state: uploadTask.snapshot.state,
        bytesTransferred: uploadTask.snapshot.bytesTransferred,
        totalBytes: uploadTask.snapshot.totalBytes,
      });
    }, 1000);
  });
};

// Get file data by shareId
export const getFileByShareId = async (shareId: string) => {
  try {
    const filesQuery = query(
      collection(db, "files"),
      where("shareId", "==", shareId)
    );
    const querySnapshot = await getDocs(filesQuery);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting file:", error);
    throw error;
  }
};

// Get file data by download URL
export const getFileByDownloadURL = async (downloadURL: string) => {
  try {
    const filesQuery = query(
      collection(db, "files"),
      where("downloadURL", "==", downloadURL)
    );
    const querySnapshot = await getDocs(filesQuery);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting file:", error);
    throw error;
  }
};

// Get user data from Firestore
export const getUserDocument = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user document:", error);
    throw error;
  }
};

export default app;
