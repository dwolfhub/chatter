#!/bin/bash

rsync -av frontend/ root@chatterjs.com:/usr/share/nginx/html/
rsync -av backend/ root@chatterjs.com:/var/www/html/