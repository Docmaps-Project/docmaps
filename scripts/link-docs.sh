#!/bin/bash

set -eu

find . -type l -exec bash -c '
  export SRC=$(readlink -f "$0");

  rm "$0";
  mkdir  "$0";

  cp -avfPR "$SRC/." "$0";
' {} \;

