#!/bin/sh

pushd $(dirname "$0")
jsx --no-cache-dir -x jsx scripts/ scripts/
sass --no-cache -t expanded --update content/:content/
popd
