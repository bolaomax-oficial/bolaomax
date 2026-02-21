#!/bin/bash

echo "🚀 Building BolãoMax for Production..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Clean previous build
echo -e "${BLUE}📦 Cleaning previous build...${NC}"
rm -rf dist/

# 2. Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}📥 Installing dependencies...${NC}"
  npm install
fi

# 3. Build frontend
echo -e "${BLUE}🏗️  Building frontend with Vite...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed!${NC}"
  exit 1
fi

# 4. Verify build
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  echo -e "${GREEN}✅ Build successful!${NC}"
  echo -e "${GREEN}📂 Output directory: dist/${NC}"
  
  # Show build size
  DIST_SIZE=$(du -sh dist | cut -f1)
  echo -e "${GREEN}📊 Build size: ${DIST_SIZE}${NC}"
  
  # Count files
  FILE_COUNT=$(find dist -type f | wc -l)
  echo -e "${GREEN}📄 Total files: ${FILE_COUNT}${NC}"
else
  echo -e "${RED}❌ Build verification failed!${NC}"
  exit 1
fi

echo -e "${GREEN}🎉 Ready for deployment!${NC}"
echo -e "${BLUE}💡 Run 'npm start' to test locally${NC}"
