#!/bin/sh

echo "
Building quizmaster-frontend"

npm install
REACT_APP_PI_URL="" npm run build
rm -R ./dist
mv ./build ./dist
./gradlew webjar install