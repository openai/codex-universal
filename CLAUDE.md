# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`codex-universal` is a reference implementation of the base Docker image available in OpenAI Codex. This repository provides a similar environment that can be pulled and run locally for debugging and development.

## Common Commands

Build the Docker image:
```bash
docker build -t codex-universal:latest .
```

Build the image using Nix:
```bash
nix build .#dockerImage
docker load < result
```

Run the container with language configuration:
```bash
docker run --rm -it \
    -e CODEX_ENV_PYTHON_VERSION=3.12 \
    -e CODEX_ENV_NODE_VERSION=20 \
    -e CODEX_ENV_RUST_VERSION=1.87.0 \
    -e CODEX_ENV_GO_VERSION=1.23.8 \
    -e CODEX_ENV_SWIFT_VERSION=6.1 \
    -v $(pwd):/workspace/$(basename $(pwd)) -w /workspace/$(basename $(pwd)) \
    ghcr.io/openai/codex-universal:latest
```

## Architecture

The project has two build systems:
1. **Docker build** (primary): Uses a multi-stage Dockerfile to build on Ubuntu 24.04
2. **Nix build** (alternative): Uses a flake to create a reproducible environment

### Key Components

- **Dockerfile**: Builds the container image with pre-installed languages and tools
- **setup_universal.sh**: Configures language runtime versions based on environment variables
- **entrypoint.sh**: Entry point script that runs setup and drops into a bash shell
- **flake.nix**: Nix alternative build configuration

### Language Version Configuration

The container uses environment variables to configure specific language versions:
- `CODEX_ENV_PYTHON_VERSION`: Switches Python version using pyenv (3.10, 3.11.12, 3.12, 3.13)
- `CODEX_ENV_NODE_VERSION`: Notification only - Node.js version is pinned at build time
- `CODEX_ENV_RUST_VERSION`: Installs specific Rust version if different from default
- `CODEX_ENV_GO_VERSION`: Installs specific Go version if different from default
- `CODEX_ENV_SWIFT_VERSION`: Installs specific Swift version if different from default

### Pre-installed Tools

Python tools: pyenv, pipx, poetry, uv, ruff, black, mypy, pyright, isort
Node.js tools: corepack, yarn, pnpm, npm, prettier, eslint, typescript
Other languages: Ruby 3.2.3, Bun 1.2.10, Java 21, Bazel/Bazelisk

### Build Process Flow

1. Dockerfile installs base packages and language toolchains
2. When container starts, `entrypoint.sh` runs `setup_universal.sh`
3. `setup_universal.sh` configures language versions based on environment variables
4. Container drops into a bash shell