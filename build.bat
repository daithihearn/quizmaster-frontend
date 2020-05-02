@ECHO off

ECHO Building quizmaster-frontend

CALL npm install
CALL npm run build
RD /S /Q dist
MOVE build dist
CALL gradlew.bat webjar install
XCOPY "build\libs\*.jar" "..\quizmaster-api\libs" /K /D /H /Y