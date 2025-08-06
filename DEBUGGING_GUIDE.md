# File Upload Debugging Guide

## What I've Added

### 1. Comprehensive Console Logging

- **Firebase Configuration**: Checks if all environment variables are properly set
- **Upload Process**: Detailed logging at every step of the file upload
- **Progress Tracking**: Logs every progress update callback
- **Error Handling**: Enhanced error reporting with detailed error information
- **File Selection**: Logs when files are selected via drag/drop or click
- **User Authentication**: Verifies user state and authentication details

### 2. Environment Variables Debugging

- Created `utils/env-check.ts` that validates all required Firebase environment variables
- Created `.env.local.template` with instructions for setting up Firebase config
- Added automatic environment validation in development mode

### 3. Error Boundary

- Added `ErrorBoundary.tsx` component to catch and display React errors
- Wrapped the upload page with error boundary for better error handling

### 4. Network Connectivity Check

- Added network status monitoring to detect offline/online states
- Logs network connectivity issues that might affect uploads

## How to Debug Upload Issues

### Step 1: Check Browser Console

Open the browser developer tools (F12) and look for these log patterns:

#### ✅ Successful Upload Logs:

```
🔧 Environment Variables Check: ✅ All environment variables set
🎯 handleFileUpload called with: {...}
👤 User from Redux: {...}
📁 File validation: {...}
🚀 Calling uploadFileToStorage with: {...}
⬆️ Creating upload task...
📊 Upload progress: {...}
✅ Upload completed successfully
```

#### ❌ Common Error Patterns:

**Missing Environment Variables:**

```
❌ Missing Firebase environment variables: [...]
```

**Solution**: Copy `.env.local.template` to `.env.local` and fill in your Firebase config

**Authentication Issues:**

```
❌ User not authenticated
❌ User UID missing
```

**Solution**: Make sure you're logged in with Google

**File Size Issues:**

```
❌ File too large: {...}
```

**Solution**: Use files smaller than 200MB

**Firebase Storage Errors:**

```
❌ Upload error occurred: { errorCode: "storage/unauthorized" }
```

**Solution**: Check Firebase Storage rules and authentication

**Network Issues:**

```
🌐 Network went offline
```

**Solution**: Check internet connection

### Step 2: Environment Setup

1. **Check if `.env.local` exists**:

   ```
   ls .env.local
   ```

2. **If not, copy the template**:

   ```
   cp .env.local.template .env.local
   ```

3. **Fill in your Firebase configuration**:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings → General → Your apps
   - Copy the config values to `.env.local`

4. **Restart development server**:
   ```
   npm run dev
   ```

### Step 3: Firebase Setup Verification

1. **Storage Rules**: Make sure your Firebase Storage rules allow authenticated uploads:

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /uploads/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

2. **Authentication**: Ensure Google Sign-In is enabled in Firebase Authentication

3. **Firestore Rules**: Make sure your Firestore rules allow authenticated reads/writes:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /files/{document} {
         allow read, write: if request.auth != null;
       }
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Step 4: Test File Upload

1. **Select a small test file** (under 10MB)
2. **Open browser console** (F12)
3. **Attempt upload** and watch the console logs
4. **Check for error patterns** mentioned above

## Console Commands for Debugging

Run these in your browser console while on the upload page:

```javascript
// Check if Firebase is properly initialized
console.log(
  "Firebase Storage:",
  typeof storage !== "undefined" ? "✅ Initialized" : "❌ Not found"
);

// Check authentication state
console.log(
  "Auth State:",
  auth?.currentUser ? "✅ Authenticated" : "❌ Not authenticated"
);

// Check environment variables (client-side only)
console.log("Environment Check:", {
  hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});
```

## Common Solutions

### Issue: Upload stuck at 0%

**Possible causes:**

- Missing environment variables
- Firebase not initialized properly
- Network connectivity issues
- Authentication problems

**Solution:** Check console logs for specific error messages

### Issue: "Storage unauthorized" error

**Solution:**

1. Check Firebase Storage rules
2. Ensure user is authenticated
3. Verify Firebase configuration

### Issue: Progress callback not working

**Solution:** Check if the progress callback function is being called in console logs

### Issue: File too large error

**Solution:** Use files under 200MB or adjust the size limit in the code

## Contact Support

If you're still having issues after following this guide, please provide:

1. Complete browser console logs
2. Firebase project configuration (without API keys)
3. File size and type you're trying to upload
4. Steps to reproduce the issue
