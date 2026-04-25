#!/usr/bin/env bash
set -e
./generate.sh
npx wrangler pages deploy dist --project-name blackroad-io
