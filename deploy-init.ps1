# PowerShell script to initialize GitHub repository and prepare for Vercel deployment

# Check if Git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed. Please install Git and try again." -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
$vercelInstalled = npm list -g vercel
if (!$vercelInstalled) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Initialize Git repository if not already initialized
if (!(Test-Path -Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Green
    git init
    git add .
    git commit -m "Initial commit"
    
    # Prompt for GitHub repository URL
    $repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)"
    
    if ($repoUrl) {
        git remote add origin $repoUrl
        git branch -M main
        git push -u origin main
        Write-Host "Repository pushed to GitHub successfully!" -ForegroundColor Green
    } else {
        Write-Host "No GitHub URL provided. You can manually push to GitHub later." -ForegroundColor Yellow
    }
} else {
    Write-Host "Git repository already initialized." -ForegroundColor Green
}

# Setup Vercel
Write-Host "\nWould you like to deploy to Vercel now? (y/n)" -ForegroundColor Cyan
$deployNow = Read-Host

if ($deployNow -eq "y" -or $deployNow -eq "Y") {
    Write-Host "Deploying to Vercel..." -ForegroundColor Green
    vercel
    
    Write-Host "\nWould you like to deploy to production? (y/n)" -ForegroundColor Cyan
    $deployProd = Read-Host
    
    if ($deployProd -eq "y" -or $deployProd -eq "Y") {
        vercel --prod
        Write-Host "Deployed to production successfully!" -ForegroundColor Green
    }
} else {
    Write-Host "You can deploy to Vercel later using the 'vercel' command." -ForegroundColor Yellow
}

Write-Host "\nSetup complete!" -ForegroundColor Green