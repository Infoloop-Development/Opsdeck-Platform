# Ubuntu VPS Setup Guide - Step by Step

Complete setup instructions for deploying Opsdeck Platform on Ubuntu VPS.

## Step 1: Initial Server Setup

SSH into your Ubuntu VPS:
```bash
ssh user@your-vps-ip
```

## Step 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

## Step 3: Install Node.js and npm

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 4: Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

## Step 5: Install Git (if needed)

```bash
sudo apt install -y git
```

## Step 6: Install PM2 (Process Manager - Optional)

```bash
sudo npm install -g pm2
```

## Step 7: Configure Firewall

```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'

# Allow SSH (important!)
sudo ufw allow ssh

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 8: Clone or Transfer Your Project

### Option A: Clone from GitHub
```bash
cd ~
git clone https://github.com/Infoloop-Development/Opsdeck-Platform.git
cd Opsdeck-Platform
```

### Option B: Transfer from Local Machine
```bash
# On your local machine:
cd /Users/premmehta/Opsdeck-Platform
tar -czf opsdeck-platform.tar.gz --exclude='node_modules' --exclude='dist' .
scp opsdeck-platform.tar.gz user@your-vps-ip:~/

# On VPS:
cd ~
tar -xzf opsdeck-platform.tar.gz -C opsdeck-platform
cd opsdeck-platform
```

## Step 9: Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

## Step 10: Deploy Files to Web Directory

```bash
# Create web directory
sudo mkdir -p /var/www/opsdeck-platform/dist

# Copy built files
sudo cp -r dist/* /var/www/opsdeck-platform/dist/

# Set permissions
sudo chown -R www-data:www-data /var/www/opsdeck-platform
sudo chmod -R 755 /var/www/opsdeck-platform
```

## Step 11: Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/opsdeck-platform

# Edit the configuration (optional - update server_name)
sudo nano /etc/nginx/sites-available/opsdeck-platform
# Change "server_name _;" to your domain or IP if you have one

# Enable the site
sudo ln -s /etc/nginx/sites-available/opsdeck-platform /etc/nginx/sites-enabled/

# Remove default Nginx site (optional)
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 12: Verify Deployment

Open your browser and visit:
- `http://your-vps-ip`
- Or `http://your-domain.com` if you configured a domain

You should see "Server is Live" message.

## Alternative: Using Node.js Server (Instead of Nginx)

If you prefer Node.js server:

```bash
# After building (Step 9), start with PM2
pm2 start server.js --name opsdeck-platform

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions it provides

# Allow port 3000 in firewall
sudo ufw allow 3000
```

Then access at: `http://your-vps-ip:3000`

## Quick Setup Script (Automated)

You can also use the automated setup script:

```bash
# On your VPS
wget https://raw.githubusercontent.com/Infoloop-Development/Opsdeck-Platform/main/setup-ubuntu-vps.sh
chmod +x setup-ubuntu-vps.sh
./setup-ubuntu-vps.sh
```

Or if you already have the files:
```bash
chmod +x setup-ubuntu-vps.sh
./setup-ubuntu-vps.sh
```

## Troubleshooting

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Check if Port 80 is in use
```bash
sudo netstat -tulpn | grep :80
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Check file permissions
```bash
ls -la /var/www/opsdeck-platform/dist/
```

### Test Nginx configuration
```bash
sudo nginx -t
```

## Updating the Application

When you make changes:

```bash
# On your local machine
npm run build
scp -r dist/* user@your-vps-ip:/var/www/opsdeck-platform/dist/
```

Or if you cloned on VPS:
```bash
# On VPS
cd ~/Opsdeck-Platform
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/opsdeck-platform/dist/
sudo systemctl reload nginx
```

## SSL/HTTPS Setup (Optional)

To add SSL certificate with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

This will automatically configure HTTPS for your site.
