#!/bin/bash

# Script to sync landing page code from Opsdeck.app repo to production-landing branch of Opsdeck-Platform repo

set -e

LANDING_REPO="https://github.com/Infoloop-Development/Opsdeck.app.git"
PLATFORM_REPO="https://github.com/Infoloop-Development/Opsdeck-Platform.git"
BRANCH_NAME="production-landing"
TEMP_DIR="/tmp/opsdeck-sync-$$"

echo "🚀 Starting landing page sync..."

# Clean up function
cleanup() {
    echo "🧹 Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Clone landing page repo
echo "📥 Cloning landing page repo..."
git clone "$LANDING_REPO" "$TEMP_DIR/landing" --depth 1

# Clone platform repo
echo "📥 Cloning platform repo..."
git clone "$PLATFORM_REPO" "$TEMP_DIR/platform"

cd "$TEMP_DIR/platform"

# Checkout or create production-landing branch
echo "🌿 Setting up production-landing branch..."
if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
    echo "   Branch exists, checking out..."
    git fetch origin "$BRANCH_NAME"
    git checkout -b "$BRANCH_NAME" "origin/$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
else
    echo "   Branch doesn't exist, creating from main..."
    git checkout main
    git checkout -b "$BRANCH_NAME"
fi

# Remove all existing files except .git
echo "🗑️  Clearing existing files..."
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# Copy landing page files
echo "📋 Copying landing page files..."
cp -r ../landing/* .

# Add all files
git add -A

# Check if there are changes
if git diff --staged --quiet; then
    echo "✅ No changes to commit. Landing page is already up to date."
    exit 0
fi

# Commit changes
echo "💾 Committing changes..."
git commit -m "Sync landing page from Opsdeck.app repo - $(date +%Y-%m-%d\ %H:%M:%S)"

# Push to remote
echo "📤 Pushing to remote..."
git push origin "$BRANCH_NAME"

echo "✅ Landing page synced successfully to production-landing branch!"
echo "🔗 Branch: $BRANCH_NAME"
echo "📦 Repo: $PLATFORM_REPO"
