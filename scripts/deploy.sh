#!/usr/bin/env bash
set -euo pipefail

# Example usage:
# DEPLOY_HOST=192.168.1.100 ./scripts/deploy.sh
# DEPLOY_HOST=myserver.se DEPLOY_USER=www-data ./scripts/deploy.sh
# DEPLOY_HOST=myserver.se SKIP_BUILD=1 ./scripts/deploy.sh --dry-run

# A deploy script that builds the project and rsyncs dist/ to a remote server.
# Environment variables:
#   DEPLOY_HOST    (required)
#   DEPLOY_USER    (default: deploy)
#   DEPLOY_PATH    (default: /var/www/huddinge-karta)
#   DEPLOY_SSH_KEY (optional: path to private key; if not set uses ssh-agent)
#   DEPLOY_PORT    (default: 22)
#   SKIP_BUILD     (set to 1 to skip npm run build and just rsync existing dist/)

# Colors
RED="\033[0;31m"
YELLOW="\033[0;33m"
GREEN="\033[0;32m"
RESET="\033[0m"

usage() {
  cat <<EOF
Usage: DEPLOY_HOST=host [DEPLOY_USER=user] [DEPLOY_PATH=path] [DEPLOY_SSH_KEY=key] [DEPLOY_PORT=22] [SKIP_BUILD=1] $(basename "$0") [--dry-run]

Environment:
  DEPLOY_HOST    Remote host or IP address (required)
  DEPLOY_USER    Remote user (default: deploy)
  DEPLOY_PATH    Remote path to deploy to (default: /var/www/huddinge-karta)
  DEPLOY_SSH_KEY Path to SSH private key (optional — uses ssh-agent if unset)
  DEPLOY_PORT    SSH port (default: 22)
  SKIP_BUILD     Set to 1 to skip npm run build and use existing dist/

Options:
  -h, --help     Show this help and exit
  --dry-run      Pass --dry-run to rsync (no remote changes)

Examples:
  DEPLOY_HOST=192.168.1.100 ./scripts/deploy.sh
  DEPLOY_HOST=myserver.se DEPLOY_USER=www-data ./scripts/deploy.sh
  DEPLOY_HOST=myserver.se SKIP_BUILD=1 ./scripts/deploy.sh --dry-run
EOF
}

# Simple print helpers
info() { echo -e "${YELLOW}[INFO]${RESET} $*"; }
success() { echo -e "${GREEN}[OK]${RESET} $*"; }
error() { echo -e "${RED}[ERROR]${RESET} $*"; }

# Trap errors to print a friendly message
_on_err() {
  local rc=$?
  local line=${1:-unknown}
  if [ "$rc" -ne 0 ]; then
    error "Deployment failed at line ${line} (exit code ${rc})."
  fi
}
trap '(_on_err $LINENO)' ERR

# Parse flags
DRY_RUN=0
while [ "${#}" -gt 0 ]; do
  case "${1:-}" in
    -h|--help)
      usage
      exit 0
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    *)
      error "Unknown option: ${1-}"
      usage
      exit 1
      ;;
  esac
done

# Defaults for environment variables (use parameter expansion to avoid unset vars)
: "${DEPLOY_USER:=deploy}"
: "${DEPLOY_PATH:=/var/www/huddinge-karta}"
: "${DEPLOY_PORT:=22}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-}"
SKIP_BUILD="${SKIP_BUILD:-0}"

# DEPLOY_HOST is required
if [ -z "${DEPLOY_HOST-}" ]; then
  error "DEPLOY_HOST is not set. Please set it, e.g. DEPLOY_HOST=example.com ./scripts/deploy.sh"
  exit 2
fi

# Banner
info "Preparing deployment"
echo ""
echo -e "Deploy target: ${YELLOW}${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}${RESET}"
echo -e "SSH port: ${YELLOW}${DEPLOY_PORT}${RESET}"
if [ -n "${DEPLOY_SSH_KEY}" ]; then
  echo -e "SSH key: ${YELLOW}${DEPLOY_SSH_KEY}${RESET}"
else
  echo -e "SSH key: ${YELLOW}(using ssh-agent or default keys)${RESET}"
fi
if [ "${SKIP_BUILD}" = "1" ]; then
  echo -e "Build: ${YELLOW}skipped (SKIP_BUILD=1)${RESET}"
else
  echo -e "Build: ${YELLOW}will run npm build${RESET}"
fi
if [ "${DRY_RUN}" -eq 1 ]; then
  echo -e "Rsync: ${YELLOW}dry-run mode enabled${RESET}"
fi
echo ""

# If skipping build, ensure dist/ exists. Otherwise run lint/validate/build.
if [ "${SKIP_BUILD}" = "1" ]; then
  info "SKIP_BUILD=1: verifying existing dist/ directory"
  if [ ! -d "dist" ]; then
    error "dist/ directory not found. Run a build or unset SKIP_BUILD."
    exit 3
  fi
else
  # Ensure npm is available
  if ! command -v npm >/dev/null 2>&1; then
    error "npm is not installed or not on PATH. Cannot run lint/validate/build."
    exit 4
  fi

  info "Running lint: npm run lint"
  npm run lint

  info "Running validate: npm run validate"
  npm run validate

  info "Running build: npm run build"
  npm run build
fi

# Confirm dist/ exists and is non-empty
if [ ! -d "dist" ]; then
  error "dist/ directory not found after build. Aborting."
  exit 5
fi

# Check dist is non-empty (has at least one file)
if ! find dist -mindepth 1 -print -quit >/dev/null 2>&1; then
  error "dist/ appears empty. Aborting."
  exit 6
fi

# Prepare rsync command
info "Preparing rsync to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
rsync_args=( -avz --delete --checksum --exclude=.DS_Store )
if [ "${DRY_RUN}" -eq 1 ]; then
  rsync_args+=( --dry-run )
fi

# Build ssh command for rsync -e
rsync_ssh=( "ssh" "-p" "${DEPLOY_PORT}" )
if [ -n "${DEPLOY_SSH_KEY}" ]; then
  rsync_ssh+=( "-i" "${DEPLOY_SSH_KEY}" )
fi
# Join rsync_ssh into single string for -e
RSYNC_RSH_COMMAND="${rsync_ssh[0]}"
for ((i=1;i<${#rsync_ssh[@]};i++)); do
  RSYNC_RSH_COMMAND+=" ${rsync_ssh[i]}"
done
rsync_args+=( -e "${RSYNC_RSH_COMMAND}" )

remote_target="${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH%/}/"

info "Starting rsync..."
echo "rsync ${rsync_args[*]} dist/ ${remote_target}"

# Execute rsync
rsync "${rsync_args[@]}" dist/ "${remote_target}"

success "Rsync completed."

# Success message with URL hint
echo ""
success "Deployment finished successfully!"
if [[ "${DEPLOY_HOST}" =~ : ]]; then
  # IPv6 or host with colon — don't assume URL
  echo -e "Hint: remote path is ${YELLOW}${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}${RESET}"
else
  echo -e "Hint: try visiting ${YELLOW}http://${DEPLOY_HOST}/${RESET} or https://${DEPLOY_HOST}/"
fi
