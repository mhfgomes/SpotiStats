#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
artifact_dir="$project_dir/dist"

cd "$project_dir"
CI=1 pnpm exec expo prebuild --platform android --clean

cd "$project_dir/android"
./gradlew assembleRelease --no-daemon

mkdir -p "$artifact_dir"
cp "$project_dir/android/app/build/outputs/apk/release/app-release.apk" \
  "$artifact_dir/SpotiStats-android.apk"

echo "Android package: $artifact_dir/SpotiStats-android.apk"
