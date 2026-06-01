#!/usr/bin/env bash

set -euo pipefail

RELEASE_TYPE="${1:-}"

if [[ "$RELEASE_TYPE" != "patch" && "$RELEASE_TYPE" != "minor" ]]; then
  echo "Usage: ./release.sh patch|minor"
  exit 1
fi

echo "==> Checking current branch"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Release must be created from main branch. Current branch: $CURRENT_BRANCH"
  exit 1
fi

echo "==> Checking git working tree"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes first."
  git status --short
  exit 1
fi

echo "==> Fetching remote state"

git fetch origin main --tags

LOCAL_SHA="$(git rev-parse main)"
REMOTE_SHA="$(git rev-parse origin/main)"

if [[ "$LOCAL_SHA" != "$REMOTE_SHA" ]]; then
  echo "Local main is not equal to origin/main."
  echo "Local:  $LOCAL_SHA"
  echo "Remote: $REMOTE_SHA"
  exit 1
fi

echo "==> Checking npm authentication"

npm whoami > /dev/null

echo "==> Checking GitHub CLI authentication"

if ! command -v gh > /dev/null 2>&1; then
  echo "GitHub CLI is not installed or not available in PATH."
  echo "Install gh or remove the GitHub release step from this script."
  exit 1
fi

gh auth status > /dev/null

echo "==> Installing dependencies"

npm ci

echo "==> Running checks"

npm run lint
npm test
npm run build

echo "==> Checking package contents"

npm pack --dry-run

CURRENT_VERSION="$(node -p "require('./package.json').version")"
PACKAGE_NAME="$(node -p "require('./package.json').name")"

echo "Package:         $PACKAGE_NAME"
echo "Current version: $CURRENT_VERSION"
echo "Release type:    $RELEASE_TYPE"

read -r -p "Continue with npm version $RELEASE_TYPE? [y/N] " CONFIRM_VERSION

if [[ "$CONFIRM_VERSION" != "y" && "$CONFIRM_VERSION" != "Y" ]]; then
  echo "Release cancelled before version bump."
  exit 0
fi

echo "==> Bumping version"

NEW_VERSION="$(npm version "$RELEASE_TYPE" --no-git-tag-version)"
NEW_VERSION_NUMBER="${NEW_VERSION#v}"

echo "New version: $NEW_VERSION"

echo "==> Verifying npm version does not already exist"

if npm view "$PACKAGE_NAME@$NEW_VERSION_NUMBER" version > /dev/null 2>&1; then
  echo "Package $PACKAGE_NAME@$NEW_VERSION_NUMBER already exists on npm."
  exit 1
fi

echo "==> Rebuilding after version bump"

npm run build

echo "==> Checking final package contents"

npm pack --dry-run

read -r -p "Create git tag, GitHub release, and publish $NEW_VERSION to npm? [y/N] " CONFIRM_RELEASE

if [[ "$CONFIRM_RELEASE" != "y" && "$CONFIRM_RELEASE" != "Y" ]]; then
  echo "Release cancelled after version bump."
  echo "You now have local package version changes. Review with: git diff"
  exit 0
fi

echo "==> Committing release version"

git add package.json package-lock.json 2>/dev/null || git add package.json
git commit -m "chore(release): $NEW_VERSION"

echo "==> Creating git tag"

git tag "$NEW_VERSION"

echo "==> Pushing commit and tag"

git push origin main
git push origin "$NEW_VERSION"

echo "==> Creating GitHub release"

gh release create "$NEW_VERSION" \
  --title "$NEW_VERSION" \
  --generate-notes

echo "==> Final npm publish check"

if npm view "$PACKAGE_NAME@$NEW_VERSION_NUMBER" version > /dev/null 2>&1; then
  echo "Package $PACKAGE_NAME@$NEW_VERSION_NUMBER already exists on npm."
  exit 1
fi

echo "==> Publishing to npm"

npm publish --access public

echo "==> Release completed: $NEW_VERSION"