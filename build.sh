#!/bin/sh

echo "
Building quizmaster-frontend"

npm install
REACT_APP_API_URL="" npm run build
rm -R ./dist
mv ./build ./dist
./gradlew webjar install
cp ./build/libs/*.jar ../quizmaster-api/libs/