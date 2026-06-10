#!/bin/bash
cd "/Users/HaoyuPersonal/Claude/Projects/Sam Johnson Personal Website"

echo "========================================="
echo "  Pushing to GitHub"
echo "========================================="
echo ""

# Init git if needed
if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Set remote (update if already exists)
git remote remove origin 2>/dev/null
git remote add origin https://github.com/desejgkjb/sam-johnson-website.git

# Stage everything and commit
git add -A
git commit -m "Add CMS: Decap CMS + content.json + cms-loader.js"

# Push (force to overwrite old files)
git push -f origin main

echo ""
echo "========================================="
echo "  Done! Check github.com/desejgkjb/sam-johnson-website"
echo "========================================="
read -p "Press Return to close..." dummy
