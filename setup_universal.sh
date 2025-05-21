#!/bin/bash --login

set -euo pipefail

CODEX_ENV_PYTHON_VERSION=${CODEX_ENV_PYTHON_VERSION:-}
CODEX_ENV_NODE_VERSION=${CODEX_ENV_NODE_VERSION:-}
CODEX_ENV_RUST_VERSION=${CODEX_ENV_RUST_VERSION:-}
CODEX_ENV_GO_VERSION=${CODEX_ENV_GO_VERSION:-}
CODEX_ENV_SWIFT_VERSION=${CODEX_ENV_SWIFT_VERSION:-}
CODEX_ENV_ERLANG_VERSION=${CODEX_ENV_ERLANG_VERSION:-}
CODEX_ENV_ELIXIR_VERSION=${CODEX_ENV_ELIXIR_VERSION:-}

echo "Configuring language runtimes..."

# For Python and Node, always run the install commands so we can install
# global libraries for linting and formatting. This just switches the version.

# For others (e.g. rust), to save some time on bootup we only install other language toolchains
# if the versions differ.

if [ -n "${CODEX_ENV_PYTHON_VERSION}" ]; then
    echo "# Python: ${CODEX_ENV_PYTHON_VERSION}"
    pyenv global "${CODEX_ENV_PYTHON_VERSION}"
fi

if [ -n "${CODEX_ENV_NODE_VERSION}" ]; then
    echo "# Node.js: ${CODEX_ENV_NODE_VERSION}"
    nvm alias default "${CODEX_ENV_NODE_VERSION}"
    nvm use "${CODEX_ENV_NODE_VERSION}"
    corepack enable
    corepack install -g yarn pnpm npm
fi

if [ -n "${CODEX_ENV_RUST_VERSION}" ]; then
    current=$(rustc --version | awk '{print $2}')   # ==> 1.86.0
    echo "# Rust: ${CODEX_ENV_RUST_VERSION} (default: ${current})"
    if [ "${current}" != "${CODEX_ENV_RUST_VERSION}" ]; then
        rustup toolchain install --no-self-update "${CODEX_ENV_RUST_VERSION}"
        rustup default "${CODEX_ENV_RUST_VERSION}"
        # Pre-install common linters/formatters
        # clippy is already installed
    fi
fi

if [ -n "${CODEX_ENV_GO_VERSION}" ]; then
    current=$(go version | awk '{print $3}')   # ==> go1.23.8
    echo "# Go: go${CODEX_ENV_GO_VERSION} (default: ${current})"
    if [ "${current}" != "go${CODEX_ENV_GO_VERSION}" ]; then
        go install "golang.org/dl/go${CODEX_ENV_GO_VERSION}@latest"
        "go${CODEX_ENV_GO_VERSION}" download
        # Place new go first in PATH
        echo "export PATH=$("go${CODEX_ENV_GO_VERSION}" env GOROOT)/bin:\$PATH" >> /etc/profile
        # Pre-install common linters/formatters
        golangci-lint --version # Already installed in base image, save us some bootup time
    fi
fi

if [ -n "${CODEX_ENV_SWIFT_VERSION}" ]; then
    current=$(swift --version | awk -F'version ' '{print $2}' | awk '{print $1}')   # ==> 6.1
    echo "# Swift: ${CODEX_ENV_SWIFT_VERSION} (default: ${current})"
    if [ "${current}" != "${CODEX_ENV_SWIFT_VERSION}" ]; then
        swiftly install --use "${CODEX_ENV_SWIFT_VERSION}"
    fi
fi

if [ -n "${CODEX_ENV_ERLANG_VERSION}" ]; then
    # Activate mise for this shell session
    eval "$(~/.local/bin/mise activate bash)"
    current=$(mise current erlang 2>/dev/null || echo "none")
    echo "# Erlang: ${CODEX_ENV_ERLANG_VERSION} (default: ${current})"
    if [ "${current}" != "${CODEX_ENV_ERLANG_VERSION}" ]; then
        mise install erlang@"${CODEX_ENV_ERLANG_VERSION}"
        mise use --global erlang@"${CODEX_ENV_ERLANG_VERSION}"
    fi
fi

if [ -n "${CODEX_ENV_ELIXIR_VERSION}" ]; then
    # Activate mise for this shell session
    eval "$(~/.local/bin/mise activate bash)"
    current=$(mise current elixir 2>/dev/null | cut -d'-' -f1 || echo "none")
    echo "# Elixir: ${CODEX_ENV_ELIXIR_VERSION} (default: ${current})"
    if [ "${current}" != "${CODEX_ENV_ELIXIR_VERSION}" ]; then
        # Determine OTP version for Elixir installation
        erlang_version=$(mise current erlang 2>/dev/null || echo "27")
        otp_version=$(echo "$erlang_version" | cut -d'.' -f1)
        mise install elixir@"${CODEX_ENV_ELIXIR_VERSION}"-otp-"${otp_version}"
        mise use --global elixir@"${CODEX_ENV_ELIXIR_VERSION}"-otp-"${otp_version}"
    fi
fi
