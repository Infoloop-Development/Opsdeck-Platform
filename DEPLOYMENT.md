# VPS Deployment Guide

This guide will help you deploy the Opsdeck Platform React app to your VPS server.

## Prerequisites

- A VPS server with Ubuntu/Debian (or similar Linux distribution)
- SSH access to your VPS
- Node.js and npm installed on your VPS (for Node.js server option)
- OR Nginx installed (for Nginx option)

## Option 1: Deploy with Nginx (Recommended)

### Step 1: Build the Application Locally

```bash
# On your local machine
npm install
npm run build
```

This creates a `dist` folder with production-ready files.

### Step 2: Transfer Files to VPS

```bash
# Create directory on VPS
ssh user@your-vps-ip "sudo mkdir -p /var/www/opsdeck-platform"

# Copy files to VPS
scp -r dist/* user@your-vps-ip:/tmp/opsdeck-platform/
ssh user@your-vps-ip "sudo mv /tmp/opsdeck-platform/* /var/www/opsdeck-platform/dist/"
```

### Step 3: Install and Configure Nginx

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Install Nginx (if not already installed)
sudo apt update
sudo apt install nginx -y

# Copy the nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/opsdeck-platform

# Update the server_name in the config file
sudo nano /etc/nginx/sites-available/opsdeck-platform
# Change "server_name _;" to your domain or IP

# Enable the site
sudo ln -s /etc/nginx/sites-available/opsdeck-platform /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### Step 4: Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/opsdeck-platform
sudo chmod -R 755 /var/www/opsdeck-platform
```

### Step 5: Configure Firewall (if needed)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## Option 2: Deploy with Node.js Server (Simple Alternative)

### Step 1: Transfer Project to VPS

```bash
# On your local machine, create a tarball
tar -czf opsdeck-platform.tar.gz --exclude='node_modules' --exclude='dist' .

# Transfer to VPS
scp opsdeck-platform.tar.gz user@your-vps-ip:~/

# SSH into VPS
ssh user@your-vps-ip

# Extract and setup
mkdir -p ~/opsdeck-platform
cd ~/opsdeck-platform
tar -xzf ~/opsdeck-platform.tar.gz
npm install
npm run build
```

### Step 2: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the server with PM2
pm2 start server.js --name opsdeck-platform

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions it provides
```

### Step 3: Configure Firewall

```bash
sudo ufw allow 3000
sudo ufw allow ssh
sudo ufw enable
```

### Step 4: Access Your Application

Open your browser and visit: `http://your-vps-ip:3000`

## Option 3: Quick Deployment Script

You can also use the deployment script:

```bash
# Make it executable
chmod +x deploy.sh

# Run it
./deploy.sh
```

## Updating the Application

When you make changes:

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **For Nginx:**
   ```bash
   scp -r dist/* user@your-vps-ip:/var/www/opsdeck-platform/dist/
   ```

3. **For Node.js:**
   ```bash
   scp -r dist/* user@your-vps-ip:~/opsdeck-platform/dist/
   ssh user@your-vps-ip "cd ~/opsdeck-platform && pm2 restart opsdeck-platform"
   ```

## Troubleshooting

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Check Node.js Server
```bash
pm2 status
pm2 logs opsdeck-platform
```

### Test Nginx Configuration
```bash
sudo nginx -t
```

## SSL/HTTPS Setup (Optional)

To add SSL certificate with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

This will automatically configure HTTPS for your site.

## Notes

- Replace `user@your-vps-ip` with your actual VPS username and IP address
- Replace `your-domain.com` with your actual domain name
- The Nginx option is recommended for production as it's more efficient
- The Node.js option is simpler and good for quick deployments
