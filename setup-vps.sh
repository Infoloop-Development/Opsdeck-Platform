#!/bin/bash

# Initial VPS Setup Script
# Run this once on a fresh Ubuntu/Debian VPS

set -e

echo "🚀 Setting up VPS for Opsdeck deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt install -y nginx git nodejs npm curl

# Install Node.js 18+ if needed
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Create web directories
echo "📁 Creating web directories..."
sudo mkdir -p /var/www/landing
sudo mkdir -p /var/www/admin
sudo mkdir -p /var/www/app
sudo chown -R www-data:www-data /var/www
sudo chmod -R 755 /var/www

# Setup nginx
echo "⚙️  Configuring Nginx..."
echo ""
echo "⚠️  IMPORTANT: Update nginx.conf with your actual domain name!"
echo "   Then copy it to: /etc/nginx/sites-available/opsdeck"
echo "   And create symlink: sudo ln -s /etc/nginx/sites-available/opsdeck /etc/nginx/sites-enabled/"
echo "   Remove default: sudo rm /etc/nginx/sites-enabled/default"
echo "   Test: sudo nginx -t"
echo "   Reload: sudo systemctl reload nginx"
echo ""

# Enable and start nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Setup firewall (if ufw is installed)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    sudo ufw allow 'Nginx Full'
    sudo ufw allow OpenSSH
    echo "   Run 'sudo ufw enable' to enable firewall"
fi

echo ""
echo "✅ VPS setup completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Update nginx.conf with your domain"
echo "   2. Copy nginx.conf to /etc/nginx/sites-available/opsdeck"
echo "   3. Run deploy-vps.sh to deploy your code"
echo "   4. Setup SSL with Let's Encrypt: sudo apt install certbot python3-certbot-nginx"
echo "   5. Get SSL: sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com -d app.yourdomain.com"
