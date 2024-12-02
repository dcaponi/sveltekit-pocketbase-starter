#!/bin/bash

# Get the current version from package.json
current_version=$(jq -r '.version' package.json)

# Display the current version and prompt for the new version
echo "Current version is $current_version"
read -p "Enter the new version (current: $current_version): " version

if [[ ! $version ]]; then
  echo "A new version is required to publish to npm!"
  exit 1
fi

# Check if the version is valid (basic check)
if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
  echo "Invalid version format. Use x.y.z or x.y.z-label format."
  exit 1
fi

# Update version in package.json
npm version "$version" --no-git-tag-version

# Stage changes, commit, and push to remote
git add package.json
git commit -m "chore: bump version to $version"
git push

# Publish to npm
npm publish --access-public