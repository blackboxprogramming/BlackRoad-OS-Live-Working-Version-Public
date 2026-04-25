#!/usr/bin/env bash
set -e

jq '.repos[] | {name, visibility}' repos.json > repos.min.json
