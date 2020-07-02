#!/bin/sh

echo "
Building quizmaster-frontend"

docker build -t localhost:5000/quizmaster-frontend:latest .
docker push localhost:5000/quizmaster-frontend:latest