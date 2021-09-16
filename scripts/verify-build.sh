#!/bin/bash

THISDIR=$(dirname $0)
PROJECTDIR=$(realpath "$THISDIR/..")

PKGVERSION=$(egrep -o '"version":\s*"[0-9\.]+"' "$PROJECTDIR/package.json" | egrep -o '[0-9\.]+')

cd $PROJECTDIR

npm run build:prod

if [ $? -ne 0 ]; then
    echo "build process failed"
    exit 1
fi

VERSIONOUTPUT=$(node "$PROJECTDIR/dist/package-sync.js" --version)

if [ $? -ne 0 ]; then
    echo "failed to run package-sync.js"
    exit 1
fi

if [ "$VERSIONOUTPUT" != "$PKGVERSION" ]; then
    echo "version check failed"
    exit 1
fi

echo "* all checks successful."
