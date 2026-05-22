#!/bin/bash
set -e

# Remove stale npm rename-temp dirs at any depth to prevent ENOTEMPTY errors
# (these accumulate when npm is interrupted while the dev server is running)
find node_modules -name '.*-????????' -type d -exec rm -rf {} + 2>/dev/null || true

npm install --no-fund --no-audit --prefer-offline --legacy-peer-deps
