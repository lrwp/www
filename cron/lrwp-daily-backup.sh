#!/bin/bash
d=`date +%u`
tar cJf /opt/backup/daily-$d.tar.xz /var/lib/couchdb/* /etc/couchdb/* /etc/nginx/*
