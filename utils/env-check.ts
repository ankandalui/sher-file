// Environment variables debugging utility
export const checkEnvironmentVariables = () => {
  const requiredEnvVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  console.log("🔧 Environment Variables Check:");
  console.log("================================");

  const results: Record<string, boolean> = {};

  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    const exists = !!value;
    results[varName] = exists;

    console.log(
      `${exists ? "✅" : "❌"} ${varName}: ${exists ? "✓ Set" : "✗ Missing"}`
    );

    if (exists && varName !== "NEXT_PUBLIC_FIREBASE_API_KEY") {
      // Show partial value for debugging (except API key for security)
      console.log(`   Value preview: ${value?.substring(0, 20)}...`);
    }
  });

  const allSet = Object.values(results).every(Boolean);
  console.log("================================");
  console.log(
    `🔧 Overall Status: ${
      allSet ? "✅ All environment variables set" : "❌ Some variables missing"
    }`
  );

  if (!allSet) {
    console.log(
      "\n📝 Missing variables need to be set in your .env.local file:"
    );
    requiredEnvVars.forEach((varName) => {
      if (!results[varName]) {
        console.log(`   ${varName}=your_value_here`);
      }
    });
    console.log(
      "\n💡 Make sure to restart your development server after adding environment variables!"
    );
  }

  return { results, allSet };
};

// Call this in development mode
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  checkEnvironmentVariables();
}
