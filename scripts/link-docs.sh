#!/bin/bash -euo pipefail

find . -type l -exec bash -c '
  export SRC=$(readlink -f "$0");

  rm "$0";
  mkdir  "$0";

  cp -vfPR "$SRC" "$0";
' {} \;

