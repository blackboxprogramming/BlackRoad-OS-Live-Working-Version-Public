#!/usr/bin/env bash
set -euo pipefail

gh api user/orgs --paginate --jq '.[].login'

