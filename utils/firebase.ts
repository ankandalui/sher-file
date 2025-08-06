import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Create or update user document in Firestore
    await createOrUpdateUserDocument(result.user);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
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
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Ensure user document exists in Firestore
      await createOrUpdateUserDocument(user);
    }
    callback(user);
  });
};

// Upload file to Firebase Storage
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
