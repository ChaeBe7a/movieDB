#!/bin/bash

# wipe dead screens
screen -w

basedir="`dirname "$0"`"

gulp='node_modules/.bin/gulp'
nodemon='node_modules/.bin/nodemon'

if [ ! -x "$gulp" ]; then
    echo "gulp is not at '$gulp'"
    exit 2;
fi

cfile="`mktemp`"

cat > "$cfile" << EOT
split
screen -t "HTTP"
stuff "cd build\012"
stuff "../$nodemon ./app.js\012"
focus
screen -t "ReactJS"
stuff "$gulp\012"
EOT

screen -m -U -S movieDB_server -c "$cfile"
