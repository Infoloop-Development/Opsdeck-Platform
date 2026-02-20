#!/bin/bash

# Deployment script for Opsdeck Platform
# This script builds the React app and prepares it for deployment

set -e

echo "🚀 Starting deployment process..."

# Build the application
echo "📦 Building React application..."
npm install
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the 'dist' folder to your VPS server"
echo "2. Set up Nginx configuration (see nginx.conf)"
echo "3. Or use the simple Node.js server (see server.js)"
echo ""
echo "To copy files to VPS, use:"
echo "  scp -r dist/* user@your-vps-ip:/var/www/opsdeck-platform/dist/"
echo ""
echo "Or use the full deployment script: deploy-to-vps.sh"
