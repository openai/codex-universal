# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`codex-universal` is a reference implementation of the base Docker image for OpenAI Codex. It provides a multi-language development environment with support for Python, Node.js, Rust, Go, Swift, Ruby, Java, and other languages.

## Key Architecture

- **Base Image**: Ubuntu 24.04 with comprehensive development tools
- **Language Runtime Management**: Environment variable-driven setup via `CODEX_ENV_*` variables
- **Runtime Scripts**: 
  - `setup_universal.sh`: Configures language versions based on environment variables
  - `entrypoint.sh`: Entry point that runs setup and drops into bash shell

## Development Environment

### Building the Docker Image
```bash
docker build -t codex-universal .
```

### Running Locally
```bash
docker run --rm -it \
    -e CODEX_ENV_PYTHON_VERSION=3.12 \
    -e CODEX_ENV_NODE_VERSION=20 \
    -e CODEX_ENV_RUST_VERSION=1.87.0 \
    -e CODEX_ENV_GO_VERSION=1.23.8 \
    -e CODEX_ENV_SWIFT_VERSION=6.1 \
    -e CODEX_ENV_NIX_CHANNEL=nixos-unstable \
    -v $(pwd):/workspace/$(basename $(pwd)) -w /workspace/$(basename $(pwd)) \
    codex-universal
```

## Language Runtime Configuration

The image supports dynamic language version configuration through environment variables:
- `CODEX_ENV_PYTHON_VERSION`: Python versions (3.10, 3.11.12, 3.12, 3.13)
- `CODEX_ENV_NODE_VERSION`: Node.js versions (18, 20, 22)
- `CODEX_ENV_RUST_VERSION`: Rust versions (1.83.0-1.87.0)
- `CODEX_ENV_GO_VERSION`: Go versions (1.22.12, 1.23.8, 1.24.3)
- `CODEX_ENV_SWIFT_VERSION`: Swift versions (5.10, 6.1)
- `CODEX_ENV_NIX_CHANNEL`: Nix channels (nixos-unstable, nixos-24.05, etc.)

## Pre-installed Tools

Each language runtime includes common development tools:
- **Python**: pyenv, poetry, uv, ruff, black, mypy, pyright, isort
- **Node.js**: corepack, yarn, pnpm, npm, prettier, eslint, typescript
- **Ruby**: 3.2.3
- **Java**: OpenJDK 21 with Gradle
- **Bun**: 1.2.14
- **Bazel**: bazelisk
- **Nix**: 2.24.11 with nixfmt-classic, nil