# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`codex-universal` is a reference implementation of the base Docker image for OpenAI Codex environments. It provides a Ubuntu 24.04-based container with pre-installed development tools and runtime managers for multiple programming languages.

## Architecture

The project consists of:

- **Dockerfile**: Multi-stage build that installs language runtimes and development tools
- **setup_universal.sh**: Runtime configuration script that uses `CODEX_ENV_*` environment variables to set specific language versions
- **entrypoint.sh**: Container entry point that runs setup and drops into a bash shell

Language runtime management is handled by dedicated version managers:
- Python: pyenv with versions 3.10, 3.11.12, 3.12, 3.13
- Node.js: nvm with versions 18, 20, 22
- Rust: rustup (configurable via environment)
- Go: manual installation with configurable versions
- Swift: swiftly with configurable versions
- Erlang/Elixir: mise with any supported versions (Elixir automatically uses compatible OTP version)

## Common Commands

### Building the Docker image
```bash
docker build -t codex-universal .
```

### Running the container locally
```bash
docker run --rm -it \
    -e CODEX_ENV_PYTHON_VERSION=3.12 \
    -e CODEX_ENV_NODE_VERSION=20 \
    -v $(pwd):/workspace/$(basename $(pwd)) \
    -w /workspace/$(basename $(pwd)) \
    codex-universal
```

### Testing different language versions
Set environment variables before running:
- `CODEX_ENV_PYTHON_VERSION`: 3.10, 3.11.12, 3.12, 3.13
- `CODEX_ENV_NODE_VERSION`: 18, 20, 22
- `CODEX_ENV_RUST_VERSION`: 1.83.0, 1.84.1, 1.85.1, 1.86.0, 1.87.0
- `CODEX_ENV_GO_VERSION`: 1.22.12, 1.23.8, 1.24.3
- `CODEX_ENV_SWIFT_VERSION`: 5.10, 6.1
- `CODEX_ENV_ERLANG_VERSION`: Any mise-supported version (e.g., 27.1.2, 26.2.5)
- `CODEX_ENV_ELIXIR_VERSION`: Any mise-supported version (e.g., 1.18.3, 1.17.3)

## Development Notes

- The setup script uses runtime version managers to switch between language versions rather than installing multiple system-wide versions
- Each language runtime includes common development tools (linters, formatters, package managers)
- Elixir installations automatically use compatible Erlang OTP versions (e.g., elixir@1.18.3-otp-27)
- mise is used for Erlang/Elixir version management and supports any versions available in the mise ecosystem
- The image is designed to approximate the OpenAI Codex environment for local development and debugging