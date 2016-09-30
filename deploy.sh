#!/bin/sh

set -o errexit -o nounset

git config --global user.email "nobody@nobody.org"
git config --global user.name "Travis CI"

git clone "https://$GITHUB_TOKEN@github.com/open-curriculum/seed.git" -b gh-pages _dist

# Get into the dist
cd _dist
cp -R ../src/* .

# Add, Commit and Push
git add --all
git commit -m "Auto push from Travis"
git push --force