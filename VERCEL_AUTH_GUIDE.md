# 🔧 Google Auth on Vercel - Troubleshooting Guide

## Quick Fix Steps

### 1. **Add Your Vercel Domain to Firebase**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `file-share-eb400`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain** and add:
   ```
   your-app-name.vercel.app
   ```
   Replace `your-app-name` with your actual Vercel deployment URL

### 2. **Update Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `file-share-eb400`
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   ```
   https://your-app-name.vercel.app
   ```
6. Add to **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/__/auth/handler
   ```

### 3. **Environment Variables Check**

Make sure your Vercel deployment has the environment variables:

In your Vercel dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add all your Firebase config variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDjGO6wIJfk85IWJ0AtRC1D1KJF9NuFkew
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=file-share-eb400.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=file-share-eb400
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=file-share-eb400.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=463111311801
NEXT_PUBLIC_FIREBASE_APP_ID=1:463111311801:web:2c30f6ac2ee384853c2668
```

### 4. **Test the Auth Flow**

The updated code now handles multiple scenarios:

**Desktop/Popup:** Uses popup method (faster)
**Mobile/Blocked:** Uses redirect method (more reliable)
**Automatic Fallback:** If popup fails, automatically tries redirect

## Common Issues & Solutions

### Issue: "Popup Blocked"

**Solution:** Code now automatically falls back to redirect method

### Issue: "This domain is not authorized"

**Solution:** Add your Vercel domain to Firebase authorized domains (Step 1)

### Issue: "Invalid redirect URI"

**Solution:** Add the correct redirect URI to Google Cloud Console (Step 2)

### Issue: Auth works locally but not on Vercel

**Solution:** Check environment variables are set in Vercel dashboard (Step 3)

## Debugging Commands

### Check if auth is working:

Open browser console on your Vercel deployment and run:

```javascript
// Check Firebase initialization
console.log("Firebase Auth:", typeof auth !== "undefined" ? "✅" : "❌");

// Check environment variables
console.log("Environment:", {
  hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

// Check current auth state
auth.onAuthStateChanged((user) => {
  console.log("Current user:", user ? user.email : "Not signed in");
});
```

## What I've Improved

1. **Mobile Support:** Added mobile detection and redirect method
2. **Popup Blocker Handling:** Automatic fallback to redirect if popup is blocked
3. **Better Error Messages:** User-friendly error messages for different scenarios
4. **Redirect Result Handling:** Properly handles auth state after redirect
5. **Enhanced Logging:** Detailed console logs for debugging

## Next Steps

1. **Deploy your updated code** to Vercel
2. **Add your Vercel domain** to Firebase (Step 1)
3. **Update Google Cloud Console** (Step 2)
4. **Test the auth flow** on mobile and desktop

The auth should now work reliably on both development and production environments!

## Get Your Vercel URL

To find your deployment URL:

1. Go to your Vercel dashboard
2. Click on your project
3. The URL will be shown at the top (e.g., `your-app-name.vercel.app`)
4. Use this URL in Firebase and Google Cloud Console configurations
