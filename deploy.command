#!/bin/bash
cd "/Users/HaoyuPersonal/Claude/Projects/Sam Johnson Personal Website"

echo "========================================="
echo "  Sam Johnson Personal Website — Deploy"
echo "========================================="
echo ""

echo "Creating new Netlify site 'sam-johnson-folio'..."
netlify sites:create --name sam-johnson-folio
echo ""

echo "Deploying to production..."
netlify deploy --prod
echo ""
echo "========================================="
echo "  Done! You can close this window."
echo "========================================="
read -p "Press Return to close..." dummy
