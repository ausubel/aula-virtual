#!/bin/sh

source /scripts/common/logs.sh

title "BACKEND" 0;

npm i
npm run build
npm run prod