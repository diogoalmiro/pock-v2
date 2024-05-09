#!/bin/bash
set -e

cd server;

npm run build

if [ -f pid.txt ]; then
  kill -9 $(cat pid)
fi

nohup npm run start > /dev/null 2>&1 & echo $! > pid