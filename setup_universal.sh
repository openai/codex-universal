#!/bin/bash --login

set -euo pipefail

CODEX_ENV_PYTHON_VERSION=${CODEX_ENV_PYTHON_VERSION:-}
CODEX_ENV_NODE_VERSION=${CODEX_ENV_NODE_VERSION:-}
CODEX_ENV_RUBY_VERSION=${CODEX_ENV_RUBY_VERSION:-}
CODEX_ENV_RUST_VERSION=${CODEX_ENV_RUST_VERSION:-}
CODEX_ENV_GO_VERSION=${CODEX_ENV_GO_VERSION:-}
CODEX_ENV_SWIFT_VERSION=${CODEX_ENV_SWIFT_VERSION:-}
CODEX_ENV_PHP_VERSION=${CODEX_ENV_PHP_VERSION:-}
CODEX_ENV_DOTNET_VERSION=${CODEX_ENV_DOTNET_VERSION:-}

DEFAULT_DOTNET_ROOT=${DOTNET_ROOT:-/usr/share/dotnet}

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
    current=$(node -v | cut -d. -f1)   # ==> v20
    echo "# Node.js: v${CODEX_ENV_NODE_VERSION} (default: ${current})"
    if [ "${current}" != "v${CODEX_ENV_NODE_VERSION}" ]; then
        nvm alias default "${CODEX_ENV_NODE_VERSION}"
        nvm use "${CODEX_ENV_NODE_VERSION}"
        corepack enable
    fi
fi

if [ -n "${CODEX_ENV_RUBY_VERSION}" ]; then
    current=$(ruby -v | cut -d' ' -f2 | cut -d'p' -f1)   # ==> 3.2.3
    echo "# Ruby: ${CODEX_ENV_RUBY_VERSION} (default: ${current})"
    if [ "${current}" != "${CODEX_ENV_RUBY_VERSION}" ]; then
        mise use --global "ruby@${CODEX_ENV_RUBY_VERSION}"
    fi
fi

if [ -n "${CODEX_ENV_RUST_VERSION}" ]; then
    current=$(rustc --version | awk '{print $2}')   # ==> 1.86.0
    echo "# Rust: ${CODEX_ENV_RUST_VERSION} (default: ${current})"
    if [ "${current}" != "${CODEX_ENV_RUST_VERSION}" ]; then
       rustup default "${CODEX_ENV_RUST_VERSION}"
    fi
fi

if [ -n "${CODEX_ENV_GO_VERSION}" ]; then
    current=$(go version | awk '{print $3}')   # ==> go1.23.8
    echo "# Go: go${CODEX_ENV_GO_VERSION} (default: ${current})"
    if [ "${current}" != "go${CODEX_ENV_GO_VERSION}" ]; then
        mise use --global "go@${CODEX_ENV_GO_VERSION}"
    fi
fi

if [ -n "${CODEX_ENV_SWIFT_VERSION}" ]; then
    current=$(swift --version | sed -n 's/^Swift version \([0-9]\+\.[0-9]\+\).*/\1/p')   # ==> 6.2
    echo "# Swift: ${CODEX_ENV_SWIFT_VERSION} (default: ${current})"
    if [ "${current}" != "${CODEX_ENV_SWIFT_VERSION}" ]; then
        mise use --global "swift@${CODEX_ENV_SWIFT_VERSION}"
    fi
fi


if [ -n "${CODEX_ENV_PHP_VERSION}" ]; then
    current=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')
    echo "# PHP: ${CODEX_ENV_PHP_VERSION} (default: ${current})"
    if [ "${current}" != "${CODEX_ENV_PHP_VERSION}" ]; then
        mise use --global "php@${CODEX_ENV_PHP_VERSION}"
    fi
fi

if [ -n "${CODEX_ENV_DOTNET_VERSION}" ]; then
    desired="${CODEX_ENV_DOTNET_VERSION}"
    current_sdk=$(dotnet --list-sdks | awk 'NR==1 {print $1}')
    echo "# .NET SDK: ${desired} (default: ${current_sdk:-none})"

    custom_root="${HOME}/.dotnet/${desired}"
    mkdir -p "${custom_root}"

    install_args=()
    match_pattern="^${desired}"
    if [[ "${desired}" =~ ^[0-9]+\.[0-9]+$ ]]; then
        install_args=(--channel "${desired}")
        match_pattern="^${desired}\."
    else
        install_args=(--version "${desired}")
    fi

    needs_install=1
    if [ -x "${custom_root}/dotnet" ]; then
        if "${custom_root}/dotnet" --list-sdks | awk '{print $1}' | grep -Eq "${match_pattern}"; then
            needs_install=0
        fi
    fi

    if [ "${needs_install}" -eq 1 ]; then
        tmp_script=$(mktemp)
        curl -sSL https://dot.net/v1/dotnet-install.sh -o "${tmp_script}"
        chmod +x "${tmp_script}"
        "${tmp_script}" "${install_args[@]}" --install-dir "${custom_root}" --no-path
        rm -f "${tmp_script}"
    fi

    export DOTNET_ROOT="${custom_root}"
    export DOTNET_MULTILEVEL_LOOKUP=0
    case ":${PATH}:" in
        *:"${DOTNET_ROOT}":*) ;;
        *) export PATH="${DOTNET_ROOT}:${PATH}" ;;
    esac
else
    export DOTNET_ROOT="${DEFAULT_DOTNET_ROOT}"
fi
