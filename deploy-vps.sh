#!/bin/bash

# VPS Deployment Script
# Deploys all 3 branches from Opsdeck-Platform repo to VPS

set -e

PLATFORM_REPO="https://github.com/Infoloop-Development/Opsdeck-Platform.git"
BASE_DIR="/var/www"
DOMAIN="${1:-yourdomain.com}"

echo "🚀 Starting VPS deployment..."

# Create directories
echo "📁 Creating directories..."
sudo mkdir -p "$BASE_DIR/landing"
sudo mkdir -p "$BASE_DIR/admin"
sudo mkdir -p "$BASE_DIR/app"

# Function to deploy a branch
deploy_branch() {
    local BRANCH=$1
    local TARGET_DIR=$2
    local TEMP_DIR="/tmp/opsdeck-$BRANCH-$$"
    
    echo ""
    echo "📦 Deploying $BRANCH to $TARGET_DIR..."
    
    # Clone repo
    git clone "$PLATFORM_REPO" "$TEMP_DIR" --depth 1 --branch "$BRANCH"
    
    cd "$TEMP_DIR"
    
    # Check if it's a React/Vite app (has package.json and vite.config.js)
    if [ -f "package.json" ] && [ -f "vite.config.js" ]; then
        echo "   🔨 Building React app..."
        npm install
        npm run build
        
        # Copy dist folder
        sudo rm -rf "$TARGET_DIR"/*
        sudo cp -r dist/* "$TARGET_DIR/"
    else
        # Static files (landing page)
        echo "   📋 Copying static files..."
        sudo rm -rf "$TARGET_DIR"/*
        sudo cp -r . "$TARGET_DIR/"
        # Remove .git folder if copied
        sudo rm -rf "$TARGET_DIR/.git"
    fi
    
    # Set permissions
    sudo chown -R www-data:www-data "$TARGET_DIR"
    sudo chmod -R 755 "$TARGET_DIR"
    
    # Cleanup
    rm -rf "$TEMP_DIR"
    
    echo "   ✅ $BRANCH deployed successfully!"
}

# Deploy all branches
deploy_branch "production-landing" "$BASE_DIR/landing"
deploy_branch "production-admin" "$BASE_DIR/admin"
deploy_branch "production" "$BASE_DIR/app"

echo ""
echo "✅ All deployments completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Update nginx configuration with your domain: $DOMAIN"
echo "   2. Test nginx config: sudo nginx -t"
echo "   3. Reload nginx: sudo systemctl reload nginx"
