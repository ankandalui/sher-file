# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "file-sharer")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Services

### Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Google** provider
5. Add your authorized domain (localhost for development)

### Enable Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add rules later)
4. Select a location (choose closest to your users)
5. Click **Done**

### Enable Storage

1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode** (we'll add rules later)
4. Select a location (same as Firestore)
5. Click **Done**

## Step 3: Get Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Add app** → **Web app**
4. Enter app nickname (e.g., "file-sharer-web")
5. Click **Register app**
6. Copy the configuration values

## Step 4: Create Environment File

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration.

## Step 5: Set Up Rules

### Storage Rules

1. Go to **Storage** → **Rules**
2. Replace the rules with the content from `firebase-storage-rules.txt`
3. Click **Publish**

### Firestore Rules

1. Go to **Firestore Database** → **Rules**
2. Replace the rules with the content from `firebase-firestore-rules.txt`
3. Click **Publish**

## Step 6: Test Configuration

1. Start your development server: `npm run dev`
2. Open browser console (F12)
3. Look for Firebase configuration logs
4. Try uploading a file
5. Check console for any errors

## Troubleshooting

### Common Issues:

1. **"Missing environment variables"**

   - Make sure `.env.local` exists and has all required values
   - Restart development server after adding environment variables

2. **"Storage unauthorized"**

   - Check Storage rules are published
   - Ensure user is authenticated

3. **"Firestore permission denied"**

   - Check Firestore rules are published
   - Ensure user is authenticated

4. **"Network error"**
   - Check internet connection
   - Verify Firebase project is in correct region

### Debug Commands:

Check browser console for these logs:

- ✅ `Firebase Configuration Debug: {...}`
- ✅ `Firebase Services Debug: {...}`
- ✅ `Environment Variables Check: ✅ All environment variables set`

If you see ❌ errors, follow the troubleshooting steps above.
