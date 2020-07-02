@ECHO off

ECHO Building quizmaster-frontend

CALL docker build -t localhost:5000/quizmaster-frontend:latest .
CALL docker push localhost:5000/quizmaster-frontend:latest