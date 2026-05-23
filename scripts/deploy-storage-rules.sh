#!/usr/bin/env bash
# Deploy Firebase Storage rules to marketplace305
# Run this once after updating storage.rules, or add FIREBASE_TOKEN to Codemagic
# so it deploys automatically on every build.
#
# Usage:
#   ./scripts/deploy-storage-rules.sh
#
# Requires firebase-tools: npm install -g firebase-tools
# Then authenticate once: firebase login
set -e
cd "$(dirname "$0")/.."
echo "Deploying Firebase Storage rules to marketplace305…"
firebase deploy --only storage --project marketplace305
echo "Done. Storage rules are now live."
