# Step 1: Install npm-check-updates globally
npm install -g npm-check-updates

# Step 2: Check which dependencies would be updated (optional)
ncu

# Step 3: Update all dependencies to the latest version in package.json
ncu -u

# Step 4: Install the updated dependencies
npm install
