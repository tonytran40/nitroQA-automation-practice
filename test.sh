#!/bin/bash

# Check if the first argument is a valid URL, otherwise set the BASE_URL to default
if [[ "$1" =~ ^https?:// ]]; then
  BASE_URL=$1
  shift # Remove the URL from the arguments
else
  BASE_URL=${BASE_URL:-"https://nitroqa.powerhrg.com"} # Default to QA URL if no URL is provided
fi

# Print the base URL being used
echo "Running tests on: $BASE_URL"

# Run Playwright tests with the specified arguments, including the BASE_URL
BASE_URL=$BASE_URL npx playwright test "$@"