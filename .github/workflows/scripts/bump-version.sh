set -euo pipefail

VERSION_FILE="version.tmp.json"

MANIFEST_VERSION=$(jq -r '.version' public/manifest.json)
IFS='.' read -r MAJOR MINOR PATCH <<< "$MANIFEST_VERSION"

LAST_BUMP_HASH=$(git log --format=%H -- public/manifest.json | head -1 || true)
RANGE="HEAD"
if [ -n "$LAST_BUMP_HASH" ]; then
  RANGE="${LAST_BUMP_HASH}..HEAD"
fi

COMMITS=$(git log --format=%s "$RANGE")

BUMP="patch"
if echo "$COMMITS" | grep -qE '^feat(\([^)]*\))?:'; then
  BUMP="minor"
fi

case "$BUMP" in
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
echo "Bump: ${BUMP}"
echo "Version: ${NEW_VERSION}"

jq -n --arg v "$NEW_VERSION" '{version: $v}' > "$VERSION_FILE"

VERSION=$(jq -r '.version' "$VERSION_FILE")

jq --arg v "$VERSION" '.version = $v' public/manifest.json > manifest.json.tmp && mv manifest.json.tmp public/manifest.json
jq --arg v "$VERSION" '.version = $v' package.json > package.json.tmp && mv package.json.tmp package.json

if [ -f package-lock.json ]; then
  jq --arg v "$VERSION" '.version = $v | .packages[""].version = $v' package-lock.json > package-lock.json.tmp && mv package-lock.json.tmp package-lock.json
fi

rm -f "$VERSION_FILE"
