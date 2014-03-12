#!/bin/bash

do_login(){
  while [ \! -s ~/.netrc ]; do
    heroku auth:login
  done
}

do_export(){
  do_login
  export GMAPS_KEY=$(heroku config:get GMAPS_KEY)
  export FB_APP_ID=$(heroku config:get FB_APP_ID)
}

do_install(){
  ./node_modules/.bin/bower install
  ./node_modules/.bin/grunt prod
}

usage_infos(){
  echo 'Usage: WHIB.sh [login|logout|export|foreman|grunt|install]'
}

if [ $# -eq 1 ]; then
  case $1 in
    login) heroku auth:login;;
    logout) heroku auth:logout;;
    export) do_export;;
    foreman) do_export; foreman start;;
    grunt) grunt watch;;
    install) do_install;;
    *) usage_infos;;
  esac
else
  usage_infos
fi
