#!/bin/bash
npm install
node ./src/bot.js > ./private/logs.txt &
# `ps aux | grep node` to find the process to kill
