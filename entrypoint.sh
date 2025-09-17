#!/bin/bash

echo "==============================="
echo "Welcome to codex CLI base!"
echo "==============================="

echo "Codex CLI is available:"
codex

echo ""
echo "Node.js is installed:"
if command -v node >/dev/null 2>&1; then
    node --version 2>/dev/null || echo "Node.js installed but may have architecture issues"
else
    echo "Node.js not found"
fi

echo ""
echo "npm is available:"
if command -v npm >/dev/null 2>&1; then
    npm --version 2>/dev/null || echo "npm installed but may have architecture issues"
else
    echo "npm not found"
fi

echo ""
echo "Environment ready. Dropping you into a bash shell."
exec bash --login "$@"
