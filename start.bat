@echo off

cd .\redis\bin\release\redis-2.8.17
start redis-server.exe

cd .\..\..\..\..\server
sails lift

exit