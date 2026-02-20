#!/bin/bash

# Automated deployment script to VPS
# Usage: ./deploy-to-vps.sh user@vps-ip

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Please provide VPS connection string"
    echo "Usage: ./deploy-to-vps.sh user@vps-ip"
    exit 1
fi

VPS=$1
REMOTE_DIR="/var/www/opsdeck-platform"

echo "🚀 Starting VPS deployment to $VPS..."

# Build the application
echo "📦 Building React application..."
npm install
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed!"

# Create remote directory
echo "📁 Creating remote directory..."
ssh $VPS "sudo mkdir -p $REMOTE_DIR/dist"

# Copy files
echo "📤 Copying files to VPS..."
scp -r dist/* $VPS:/tmp/opsdeck-platform-temp/
ssh $VPS "sudo rm -rf $REMOTE_DIR/dist/* && sudo mv /tmp/opsdeck-platform-temp/* $REMOTE_DIR/dist/ && sudo chown -R www-data:www-data $REMOTE_DIR && sudo chmod -R 755 $REMOTE_DIR"

# Copy nginx config
echo "⚙️  Setting up Nginx configuration..."
scp nginx.conf $VPS:/tmp/nginx-opsdeck.conf
ssh $VPS "sudo cp /tmp/nginx-opsdeck.conf /etc/nginx/sites-available/opsdeck-platform && sudo ln -sf /etc/nginx/sites-available/opsdeck-platform /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx"

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application should now be live!"
echo "   Visit: http://$(echo $VPS | cut -d'@' -f2)"
