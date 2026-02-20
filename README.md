# Opsdeck Platform

A simple React.js application displaying server status.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Deployment to VPS

### Quick Deploy (Automated)

```bash
./deploy-to-vps.sh user@your-vps-ip
```

### Manual Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**For Ubuntu VPS:** See [UBUNTU-SETUP.md](./UBUNTU-SETUP.md) for step-by-step Ubuntu setup guide.

**Quick steps:**
1. Build: `npm run build`
2. Copy `dist` folder to VPS
3. Configure Nginx or use Node.js server

### Node.js Server (Alternative)

```bash
npm install
npm run build
npm start
```

For production, use PM2:
```bash
pm2 start server.js --name opsdeck-platform
pm2 save
pm2 startup
```
