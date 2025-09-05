# Deployment Guide for CodeLock

## GitHub Deployment

### Prerequisites
- Git installed on your machine
- GitHub account
- Repository created on GitHub

### Steps

1. **Initialize Git Repository**
   ```bash
   git init
   ```

2. **Add Files to Git**
   ```bash
   git add .
   ```

3. **Commit Changes**
   ```bash
   git commit -m "Initial commit"
   ```

4. **Link to GitHub Repository**
   ```bash
   git remote add origin https://github.com/yourusername/codelock.git
   ```

5. **Push to GitHub**
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Vercel Deployment

### Prerequisites
- Vercel account (can sign up with GitHub)
- Node.js installed (for Vercel CLI)

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings (usually the defaults work fine for static sites)
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Project**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Automated Deployment with GitHub Actions

This project includes a GitHub Actions workflow that automatically deploys to Vercel when you push to the main branch.

To set it up:

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add the following secrets:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

You can get these values by running:
```bash
vercel whoami
vercel projects list
```

## Using the Deployment Script

This project includes a PowerShell script (`deploy-init.ps1`) that automates the GitHub and Vercel deployment process:

```bash
./deploy-init.ps1
```

Follow the prompts to initialize Git, push to GitHub, and deploy to Vercel.