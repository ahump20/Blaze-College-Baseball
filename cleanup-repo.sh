#!/bin/bash

echo "🧹 BSI Repository Cleanup Script"
echo "================================"

# Create backup
echo "📦 Creating backup..."
git stash push -m "Pre-cleanup backup $(date)"

# Remove backup files
echo "🗑️  Removing backup files..."
rm -f index-*backup*.html
rm -f index-*previous*.html
rm -f index-*old*.html
rm -f index-*broken*.html

# Remove old deployment logs
echo "📝 Cleaning deployment logs..."
rm -f deployment-log-*.txt
rm -f deployment-manifest.txt

# Remove duplicate images
echo "🖼️  Cleaning duplicate images..."
rm -f "BI site picture.png"
rm -f "BI site pictures.png"

# Organize files
echo "📁 Organizing file structure..."
mkdir -p {frontend,backend,config,docs,scripts,assets}

# Move files to appropriate directories
mv *.html frontend/ 2>/dev/null || true
mv *.js frontend/ 2>/dev/null || true
mv *.css frontend/ 2>/dev/null || true
mv *.png frontend/assets/ 2>/dev/null || true
mv *.jpg frontend/assets/ 2>/dev/null || true
mv *.jpeg frontend/assets/ 2>/dev/null || true

# Move API files
mv api/ backend/ 2>/dev/null || true
mv *.py backend/ 2>/dev/null || true

# Move config files
mv *.json config/ 2>/dev/null || true
mv *.yaml config/ 2>/dev/null || true
mv *.toml config/ 2>/dev/null || true
mv *.env* config/ 2>/dev/null || true

# Move documentation
mv *.md docs/ 2>/dev/null || true

# Move scripts
mv *.sh scripts/ 2>/dev/null || true

echo "✅ Cleanup complete!"
echo "📊 Repository structure improved"
echo "🚀 Ready for next phase of improvements"