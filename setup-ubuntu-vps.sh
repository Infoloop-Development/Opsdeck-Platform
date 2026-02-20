#!/bin/bash

# Ubuntu VPS Setup Script for Opsdeck Platform
# Run this on your Ubuntu VPS server

set -e

echo "🚀 Setting up Opsdeck Platform on Ubuntu..."

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Node.js and npm
echo "📦 Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Git (if not already installed)
echo "📦 Installing Git..."
sudo apt install -y git

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/opsdeck-platform/dist
sudo chown -R $USER:$USER /var/www/opsdeck-platform

# Install PM2 globally (for Node.js server option)
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

# Start and enable Nginx
echo "⚙️  Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

echo ""
echo "✅ Ubuntu VPS setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Clone or transfer your project files to the VPS"
echo "2. Run: cd ~/opsdeck-platform && npm install && npm run build"
echo "3. Copy dist files: sudo cp -r dist/* /var/www/opsdeck-platform/dist/"
echo "4. Configure Nginx (see DEPLOYMENT.md)"
echo ""
echo "🌐 Nginx is now running and ready!"
