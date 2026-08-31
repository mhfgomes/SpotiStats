#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
artifact_dir="$project_dir/dist"
derived_data="$project_dir/build/ios-device"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "iOS packaging requires macOS and Xcode." >&2
  exit 1
fi

cd "$project_dir"
if [[ ! -d ios/SpotiStats.xcworkspace ]]; then
  CI=1 pnpm exec expo prebuild --platform ios --clean
fi

xcodebuild \
  -workspace ios/SpotiStats.xcworkspace \
  -scheme SpotiStats \
  -configuration Release \
  -sdk iphoneos \
  -destination "generic/platform=iOS" \
  -derivedDataPath "$derived_data" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  build

app_path="$(find "$derived_data/Build/Products/Release-iphoneos" -maxdepth 1 -name '*.app' -print -quit)"
if [[ -z "$app_path" ]]; then
  echo "Unsigned iOS device app was not produced." >&2
  exit 1
fi

package_dir="$(mktemp -d)"
trap 'rm -rf "$package_dir"' EXIT
mkdir -p "$package_dir/Payload" "$artifact_dir"
ditto "$app_path" "$package_dir/Payload/SpotiStats.app"

cd "$package_dir"
zip -qry "$artifact_dir/SpotiStats-ios-unsigned.ipa" Payload

echo "Unsigned iOS package: $artifact_dir/SpotiStats-ios-unsigned.ipa"
