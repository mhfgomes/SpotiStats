#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
artifact_dir="$project_dir/dist"
derived_data="$project_dir/build/ios-simulator"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "iOS packaging requires macOS and Xcode." >&2
  exit 1
fi

cd "$project_dir"
CI=1 pnpm exec expo prebuild --platform ios --clean

xcodebuild \
  -workspace ios/SpotiStats.xcworkspace \
  -scheme SpotiStats \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath "$derived_data" \
  CODE_SIGNING_ALLOWED=NO \
  build

app_path="$(find "$derived_data/Build/Products/Release-iphonesimulator" -maxdepth 1 -name '*.app' -print -quit)"
if [[ -z "$app_path" ]]; then
  echo "iOS Simulator app was not produced." >&2
  exit 1
fi

mkdir -p "$artifact_dir"
ditto -c -k --sequesterRsrc --keepParent "$app_path" \
  "$artifact_dir/SpotiStats-ios-simulator.app.zip"

echo "iOS package: $artifact_dir/SpotiStats-ios-simulator.app.zip"
