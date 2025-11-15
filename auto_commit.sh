#!/bin/bash

# Get today's date in YYYY-MM-DD format
TODAY=$(date +"%Y-%m-%d")

# add all changes
git add *
# commit changes
git commit -m "🤖 Auto commit : $TODAY"
git push origin master