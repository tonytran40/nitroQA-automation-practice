#!/bin/bash

# Ensure testing does not occur in production
if [[ "$1" =~ ^https?://nitro.powerhrg.com ]]; then
  echo "Do not run tests on production. Exitting..."
  exit 1
# Check if the first argument is a valid URL, otherwise set the BASE_URL to default
elif [[ "$1" =~ ^https?:// ]]; then
  BASE_URL=$1
  shift # Remove the URL from the arguments
else
  BASE_URL="https://nitroqa.powerhrg.com" # Default to QA URL if no URL is provided
fi

# Print the base URL being used
echo "Running tests on: $BASE_URL"

# Run Playwright tests with the specified arguments, including the BASE_URL
BASE_URL=$BASE_URL npx playwright test "$@"