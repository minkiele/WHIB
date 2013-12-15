#!/bin/bash

do_login(){
  while [ \! -s ~/.netrc ]; do
    heroku auth:login
  done
}

do_export(){
  do_login
  export GMAPS_KEY=$(heroku config:get GMAPS_KEY)
}

usage_infos(){
  echo 'Usage: WHIB.sh [login|logout|export|foreman|grunt]'
}

if [ $# -eq 1 ]; then
  case $1 in
    login) heroku auth:login;;
    logout) heroku auth:logout;;
    export) do_export;;
    foreman) do_export; foreman start;;
    grunt) grunt watch;;
    *) usage_infos;;
  esac
else
  usage_infos
fi