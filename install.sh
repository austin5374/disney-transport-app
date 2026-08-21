#!/bin/bash
# Install and launch the Walt Disney World transportation planner.
# Run this from the disney-transport-app directory.

set -e

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "Done. Start the app with:"
echo ""
echo "   npx expo start --web    (browser)"
echo "   npx expo start          (scan the QR code with Expo Go)"
echo ""
