#!/usr/bin/expect
set timeout 30
set PASSWORD UZ12qnF75F2TMV
set REMOTE_HOST admin@139.196.196.25

spawn ssh -p 58888 ${REMOTE_HOST}
expect "*password*" {send "$PASSWORD\r"}
interact