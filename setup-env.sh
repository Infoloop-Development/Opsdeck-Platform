#!/bin/bash

# Environment Variables Setup Script
# Creates .env files for production and production-admin branches

set -e

BASE_DIR="/var/www"

echo "🔧 Setting up environment variables..."

# Production branch (Next.js) - app.domain.com
echo ""
echo "📝 Setting up environment for production branch (app.domain.com)..."
read -p "   MongoDB Connection String: " MONGO_URI
read -p "   JWT Secret: " JWT_SECRET
read -p "   Cloudinary Cloud Name: " CLOUDINARY_CLOUD_NAME
read -p "   Cloudinary API Key: " CLOUDINARY_API_KEY
read -p "   Cloudinary API Secret: " CLOUDINARY_API_SECRET
read -p "   Stripe Secret Key: " STRIPE_SECRET_KEY
read -p "   Stripe Publishable Key: " STRIPE_PUBLISHABLE_KEY
read -p "   Nodemailer Email: " NODEMAILER_EMAIL
read -p "   Nodemailer Password: " NODEMAILER_PASSWORD
read -p "   Next.js Base URL (e.g., https://app.domain.com): " NEXT_PUBLIC_BASE_URL

cat > "$BASE_DIR/app/.env.production" << EOF
# MongoDB
MONGODB_URI=$MONGO_URI

# JWT
JWT_SECRET=$JWT_SECRET

# Cloudinary
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET

# Stripe
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY

# Email
NODEMAILER_EMAIL=$NODEMAILER_EMAIL
NODEMAILER_PASSWORD=$NODEMAILER_PASSWORD

# Next.js
NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
NODE_ENV=production
EOF

echo "   ✅ Environment file created at $BASE_DIR/app/.env.production"

# Production-admin branch (Vite + React) - admin.domain.com
echo ""
echo "📝 Setting up environment for production-admin branch (admin.domain.com)..."
read -p "   API Base URL (e.g., https://app.domain.com/api): " VITE_API_BASE_URL

cat > "$BASE_DIR/admin/.env.production" << EOF
# API Configuration
VITE_API_BASE_URL=$VITE_API_BASE_URL
VITE_NODE_ENV=production
EOF

echo "   ✅ Environment file created at $BASE_DIR/admin/.env.production"

echo ""
echo "✅ Environment setup completed!"
echo ""
echo "⚠️  Note: These .env files will be copied during deployment."
echo "   Make sure to run this script before deploying if you need environment variables."
