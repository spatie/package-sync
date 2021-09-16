#!/bin/bash

THISDIR=$(dirname $0)
PROJECTDIR=$(realpath "$THISDIR/..")

PKGVERSION=$(egrep -o '"version":\s*"[0-9\.]+"' "$PROJECTDIR/package.json" | egrep -o '[0-9\.]+')

pushd $PROJECTDIR

npm run test

if [ $? -ne 0 ]; then
  echo 'tests failed, not creating archive'
  exit 1
fi

npm run build:prod

tar czf package-sync-standalone-$PKGVERSION.tar.gz --exclude=dist/temp dist

popd
