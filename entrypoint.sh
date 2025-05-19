#!/bin/bash

echo "=================================="
echo "Welcome to openai/codex-universal!"
echo "=================================="

/opt/codex/setup_universal.sh

echo ""
echo "Configure language versions with the CODEX_ENV_* variables:" >&2
echo "  CODEX_ENV_PYTHON_VERSION  CODEX_ENV_NODE_VERSION" >&2
echo "  CODEX_ENV_RUST_VERSION    CODEX_ENV_GO_VERSION" >&2
echo "  CODEX_ENV_SWIFT_VERSION" >&2
echo "For full documentation see /opt/codex/README.md or" >&2
echo "https://github.com/openai/codex-universal" >&2

echo "Environment ready. Dropping you into a bash shell."
exec bash --login "$@"
