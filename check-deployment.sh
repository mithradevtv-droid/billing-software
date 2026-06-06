#!/bin/bash

# Render Deployment Checklist Script
# Run this script to verify your app is ready for deployment

echo "🔍 LedgerOne Billing System - Deployment Checklist"
echo "=================================================="
echo ""

# Check 1: Git Repository
echo "✓ Checking Git setup..."
if [ -d ".git" ]; then
  echo "  ✅ Git repository initialized"
else
  echo "  ❌ Git not initialized. Run: git init"
  exit 1
fi

# Check 2: Node.js Version
echo ""
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "  Node version: $NODE_VERSION"
if [[ "$NODE_VERSION" == v18* ]] || [[ "$NODE_VERSION" == v19* ]] || [[ "$NODE_VERSION" == v20* ]]; then
  echo "  ✅ Compatible Node version"
else
  echo "  ⚠️  Recommended Node 18+. Current: $NODE_VERSION"
fi

# Check 3: Dependencies
echo ""
echo "✓ Checking dependencies..."
if [ -f "package.json" ]; then
  echo "  ✅ package.json found"
else
  echo "  ❌ package.json not found"
  exit 1
fi

if [ -d "node_modules" ]; then
  echo "  ✅ Dependencies installed"
else
  echo "  ⚠️  Run: npm install"
fi

# Check 4: Build
echo ""
echo "✓ Testing build..."
if npm run build > /dev/null 2>&1; then
  echo "  ✅ Build successful"
else
  echo "  ❌ Build failed. Fix errors and retry."
  npm run build
  exit 1
fi

# Check 5: Environment Files
echo ""
echo "✓ Checking environment configuration..."
if [ -f ".env.example" ]; then
  echo "  ✅ .env.example found"
else
  echo "  ⚠️  .env.example not found"
fi

if [ -f ".gitignore" ]; then
  if grep -q "billing.db" ".gitignore"; then
    echo "  ✅ Database files in .gitignore"
  else
    echo "  ⚠️  Add billing.db to .gitignore"
  fi
fi

# Check 6: Deployment Files
echo ""
echo "✓ Checking deployment configuration..."
if [ -f "render.yaml" ]; then
  echo "  ✅ render.yaml found"
else
  echo "  ⚠️  render.yaml not found"
fi

if [ -f "DEPLOYMENT.md" ]; then
  echo "  ✅ DEPLOYMENT.md found"
else
  echo "  ⚠️  DEPLOYMENT.md not found"
fi

# Check 7: Git Status
echo ""
echo "✓ Checking Git status..."
if [ -z "$(git status --porcelain)" ]; then
  echo "  ✅ Working directory clean"
else
  echo "  ⚠️  Uncommitted changes. Run: git status"
fi

# Check 8: Remote
echo ""
echo "✓ Checking Git remote..."
if git remote get-url origin > /dev/null 2>&1; then
  echo "  ✅ Origin remote configured"
else
  echo "  ⚠️  Add GitHub remote: git remote add origin <url>"
fi

# Summary
echo ""
echo "=================================================="
echo "✨ Deployment Checklist Complete!"
echo ""
echo "📋 Next Steps:"
echo "  1. Commit changes: git add . && git commit -m 'Prepare for deployment'"
echo "  2. Push to GitHub: git push -u origin main"
echo "  3. Go to https://dashboard.render.com"
echo "  4. Create Web Service and connect this repository"
echo "  5. Follow instructions in DEPLOYMENT.md"
echo ""
echo "🚀 Happy deploying!"
