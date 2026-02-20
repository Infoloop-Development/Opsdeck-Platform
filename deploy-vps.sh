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
    
    # Check for package.json
    if [ -f "package.json" ]; then
        echo "   📦 Installing dependencies..."
        npm install --production=false
        
        # Check if it's Next.js (has next.config.js or next.config.ts)
        if [ -f "next.config.js" ] || [ -f "next.config.ts" ] || [ -f "next.config.mjs" ]; then
            echo "   🔨 Building Next.js app..."
            
            # Check for .env files and copy them if they exist on VPS
            if [ -f "$TARGET_DIR/.env.local" ] || [ -f "$TARGET_DIR/.env.production" ]; then
                echo "   📋 Copying environment variables..."
                [ -f "$TARGET_DIR/.env.local" ] && cp "$TARGET_DIR/.env.local" .env.local || true
                [ -f "$TARGET_DIR/.env.production" ] && cp "$TARGET_DIR/.env.production" .env.production || true
            fi
            
            npm run build
            
            # Next.js static export goes to 'out' folder, server mode uses '.next'
            if [ -d "out" ]; then
                echo "   📋 Copying Next.js static export..."
                sudo rm -rf "$TARGET_DIR"/*
                sudo cp -r out/* "$TARGET_DIR/"
            elif [ -d ".next" ]; then
                echo "   ⚠️  Next.js server mode detected. You may need to run 'npm start' with PM2."
                echo "   📋 Copying Next.js build files..."
                sudo rm -rf "$TARGET_DIR"/*
                sudo cp -r .next "$TARGET_DIR/.next"
                sudo cp -r public "$TARGET_DIR/public" 2>/dev/null || true
                sudo cp package.json "$TARGET_DIR/"
                sudo cp next.config.* "$TARGET_DIR/" 2>/dev/null || true
                sudo cp -r node_modules "$TARGET_DIR/node_modules"
            fi
            
        # Check if it's Vite (has vite.config.js or vite.config.ts)
        elif [ -f "vite.config.js" ] || [ -f "vite.config.ts" ] || [ -f "vite.config.mjs" ]; then
            echo "   🔨 Building Vite + React app..."
            npm run build
            
            # Vite builds to 'dist' folder
            if [ -d "dist" ]; then
                echo "   📋 Copying Vite build output..."
                sudo rm -rf "$TARGET_DIR"/*
                sudo cp -r dist/* "$TARGET_DIR/"
            fi
            
        else
            # Other Node.js apps - try to build
            echo "   🔨 Attempting to build..."
            npm run build 2>/dev/null || echo "   ⚠️  No build script found, copying files as-is..."
            
            # Check for common build outputs
            if [ -d "dist" ]; then
                sudo rm -rf "$TARGET_DIR"/*
                sudo cp -r dist/* "$TARGET_DIR/"
            elif [ -d "build" ]; then
                sudo rm -rf "$TARGET_DIR"/*
                sudo cp -r build/* "$TARGET_DIR/"
            else
                sudo rm -rf "$TARGET_DIR"/*
                sudo cp -r . "$TARGET_DIR/"
                sudo rm -rf "$TARGET_DIR/.git"
                sudo rm -rf "$TARGET_DIR/node_modules"
            fi
        fi
    else
        # Static files (landing page - no package.json)
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
