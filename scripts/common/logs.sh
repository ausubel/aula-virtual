#!/bin/bash

GREEN='\033[32m'
RED='\033[31m'
MAGENTA='\x1b[35m'

RESET='\033[0m'

success_message() {
  local message="$1"
  echo -e "$GREEN$message$RESET"
}

error_message() {
  local message="$1"
  echo -e "$RED$message$RESET"
}

title() {
  local content=$(echo "$1" | tr '[:lower:]' '[:upper:]')
  local title="*** $content ***";
  local withNextLine=$2;
  if [[ "$withNextLine" -eq 1 ]]; then
    title="$title\n";
  fi
  echo -e "\n$MAGENTA$title$RESET";
}