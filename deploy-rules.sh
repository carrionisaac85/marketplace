#!/bin/bash
cd /home/runner/workspace
echo ""
echo "=== Firebase Rules Deployer ==="
echo ""

# Check if already logged in
npx firebase-tools login:list 2>/dev/null | grep -q "@" && LOGGED_IN=true || LOGGED_IN=false

if [ "$LOGGED_IN" = false ]; then
  echo "Step 1: Login to Firebase (a browser URL will appear — open it and sign in)"
  echo ""
  npx firebase-tools login --no-localhost
  echo ""
fi

echo "Deploying firestore.rules to project marketplace305..."
npx firebase-tools deploy --only firestore:rules --project marketplace305

echo ""
echo "Done! Admin deletes should now work."
