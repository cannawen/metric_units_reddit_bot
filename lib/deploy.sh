#!/bin/bash
npm install
node ./src/bot.js &
# `ps aux | grep node` to find the process to kill
