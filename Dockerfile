FROM ubuntu:24.04

ARG TARGETOS
ARG TARGETARCH

ENV LANG="C.UTF-8"
ENV HOME=/root
ENV DEBIAN_FRONTEND=noninteractive

### BASE ###

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        binutils=2.42-* \
        sudo=1.9.* \
        build-essential=12.10* \
        bzr=2.7.* \
        curl=8.5.* \
        default-libmysqlclient-dev=1.1.* \
        dnsutils=1:9.18.* \
        gettext=0.21-* \
        git=1:2.43.* \
        git-lfs=3.4.* \
        gnupg=2.4.* \
        inotify-tools=3.22.* \
        iputils-ping=3:20240117-* \
        jq=1.7.* \
        libbz2-dev=1.0.* \
        libc6=2.39-* \
        libc6-dev=2.39-* \
        libcurl4-openssl-dev=8.5.* \
        libdb-dev=1:5.3.* \
        libedit2=3.1-* \
        libffi-dev=3.4.* \
        libgcc-13-dev=13.3.* \
        libgdbm-compat-dev=1.23-* \
        libgdbm-dev=1.23-* \
        libgdiplus=6.1+dfsg-* \
        libgssapi-krb5-2=1.20.* \
        liblzma-dev=5.6.* \
        libncurses-dev=6.4+20240113-* \
        libnss3-dev=2:3.98-* \
        libpq-dev=16.10-* \
        libpsl-dev=0.21.* \
        libpython3-dev=3.12.* \
        libreadline-dev=8.2-* \
        libsqlite3-dev=3.45.* \
        libssl-dev=3.0.* \
        libstdc++-13-dev=13.3.* \
        libunwind8=1.6.* \
        libuuid1=2.39.* \
        libxml2-dev=2.9.* \
        libz3-dev=4.8.* \
        make=4.3-* \
        moreutils=0.69-* \
        netcat-openbsd=1.226-* \
        openssh-client=1:9.6p1-* \
        pkg-config=1.8.* \
        protobuf-compiler=3.21.* \
        ripgrep=14.1.* \
        rsync=3.2.* \
        software-properties-common=0.99.* \
        sqlite3=3.45.* \
        swig3.0=3.0.* \
        tk-dev=8.6.* \
        tzdata=2025b-* \
        unixodbc-dev=2.3.* \
        unzip=6.0-* \
        uuid-dev=2.39.* \
        wget=1.21.* \
        xz-utils=5.6.* \
        zip=3.0-* \
        zlib1g=1:1.3.* \
        zlib1g-dev=1:1.3.* \
    && rm -rf /var/lib/apt/lists/*

### MISE ###

RUN install -dm 0755 /etc/apt/keyrings \
    && curl -fsSL https://mise.jdx.dev/gpg-key.pub | gpg --batch --yes --dearmor -o /etc/apt/keyrings/mise-archive-keyring.gpg \
    && chmod 0644 /etc/apt/keyrings/mise-archive-keyring.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/mise-archive-keyring.gpg] https://mise.jdx.dev/deb stable main" > /etc/apt/sources.list.d/mise.list \
    && apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends mise/stable \
    && rm -rf /var/lib/apt/lists/* \
    && echo 'eval "$(mise activate bash)"' >> /etc/profile \
    && mise settings set experimental true \
    && mise settings set override_tool_versions_filenames none \
    && mise settings add idiomatic_version_file_enable_tools "[]"

ENV PATH=$HOME/.local/share/mise/shims:$PATH

### LLVM ###

RUN apt-get update && apt-get install -y --no-install-recommends \
        cmake=3.28.* \
        ccache=4.9.* \
        ninja-build=1.11.* \
        nasm=2.16.* \
        yasm=1.3.* \
        gawk=1:5.2.* \
        lsb-release=12.0-* \
    && rm -rf /var/lib/apt/lists/* \
    && bash -c "$(curl -fsSL https://apt.llvm.org/llvm.sh)"

### PYTHON ###

ARG PYENV_VERSION=v2.6.10
ARG PYTHON_VERSIONS="3.11.12 3.10 3.12 3.13 3.14.0"

# Install pyenv
ENV PYENV_ROOT=/root/.pyenv
ENV PATH=$PYENV_ROOT/bin:$PATH
RUN git -c advice.detachedHead=0 clone --branch "$PYENV_VERSION" --depth 1 https://github.com/pyenv/pyenv.git "$PYENV_ROOT" \
    && echo 'export PYENV_ROOT="$HOME/.pyenv"' >> /etc/profile \
    && echo 'export PATH="$PYENV_ROOT/shims:$PYENV_ROOT/bin:$PATH"' >> /etc/profile \
    && echo 'eval "$(pyenv init - bash)"' >> /etc/profile \
    && cd "$PYENV_ROOT" \
    && src/configure \
    && make -C src \
    && pyenv install $PYTHON_VERSIONS \
    && pyenv global "${PYTHON_VERSIONS%% *}" \
    && rm -rf "$PYENV_ROOT/cache"

# Install pipx for common global package managers (e.g. poetry)
ENV PIPX_BIN_DIR=/root/.local/bin
ENV PATH=$PIPX_BIN_DIR:$PATH
RUN apt-get update \
    && apt-get install -y --no-install-recommends pipx=1.4.* \
    && rm -rf /var/lib/apt/lists/* \
    && pipx install --pip-args="--no-cache-dir --no-compile" poetry==2.1.* uv==0.7.* \
    && for pyv in "${PYENV_ROOT}/versions/"*; do \
         "$pyv/bin/python" -m pip install --no-cache-dir --no-compile --upgrade pip && \
         "$pyv/bin/pip" install --no-cache-dir --no-compile ruff black mypy pyright isort pytest; \
       done \
    && rm -rf /root/.cache/pip ~/.cache/pip ~/.cache/pipx
    
# Reduce the verbosity of uv - impacts performance of stdout buffering
ENV UV_NO_PROGRESS=1

### NODE ###

ARG NVM_VERSION=v0.40.2
ARG NODE_VERSION=22

ENV NVM_DIR=/root/.nvm
# Corepack tries to do too much - disable some of its features:
# https://github.com/nodejs/corepack/blob/main/README.md
ENV COREPACK_DEFAULT_TO_LATEST=0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV COREPACK_ENABLE_AUTO_PIN=0
ENV COREPACK_ENABLE_STRICT=0

RUN git -c advice.detachedHead=0 clone --branch "$NVM_VERSION" --depth 1 https://github.com/nvm-sh/nvm.git "$NVM_DIR" \
    && echo 'source $NVM_DIR/nvm.sh' >> /etc/profile \
    && echo "prettier\neslint\ntypescript" > $NVM_DIR/default-packages \
    && . $NVM_DIR/nvm.sh \
    # The latest versions of npm aren't supported on node 18, so we install each set differently
    && nvm install 18 && nvm use 18 && npm install -g npm@10.9 pnpm@10.12 && corepack enable && corepack install -g yarn \
    && nvm install 20 && nvm use 20 && npm install -g npm@11.4 pnpm@10.12 && corepack enable && corepack install -g yarn \
    && nvm install 22 && nvm use 22 && npm install -g npm@11.4 pnpm@10.12 && corepack enable && corepack install -g yarn \
    && nvm alias default "$NODE_VERSION" \
    && nvm cache clear \
    && npm cache clean --force || true \
    && pnpm store prune || true \
    && yarn cache clean || true

### BUN ###

ARG BUN_VERSION=1.2.14
RUN mise use --global "bun@${BUN_VERSION}" \
    && mise cache clear || true \
    && rm -rf "$HOME/.cache/mise" "$HOME/.local/share/mise/downloads"

### JAVA ###

ARG GRADLE_VERSION=8.14
ARG MAVEN_VERSION=3.9.10
# OpenJDK 11 is not available for arm64. Codex Web only uses amd64 which
# does support 11.
ARG AMD_JAVA_VERSIONS="21 17 11"
ARG ARM_JAVA_VERSIONS="21 17"

RUN JAVA_VERSIONS="$( [ "$TARGETARCH" = "arm64" ] && echo "$ARM_JAVA_VERSIONS" || echo "$AMD_JAVA_VERSIONS" )" \
    && for v in $JAVA_VERSIONS; do mise install "java@${v}"; done \
    && mise use --global "java@${JAVA_VERSIONS%% *}" \
    && mise use --global "gradle@${GRADLE_VERSION}" \
    && mise use --global "maven@${MAVEN_VERSION}" \
    && mise cache clear || true \
    && rm -rf "$HOME/.cache/mise" "$HOME/.local/share/mise/downloads"

### SWIFT ###

ARG SWIFT_VERSIONS="6.2 6.1 5.10.1"
# mise currently broken for swift on ARM
RUN if [ "$TARGETARCH" = "amd64" ]; then \
      for v in $SWIFT_VERSIONS; do \
        mise install "swift@${v}"; \
      done && \
      mise use --global "swift@${SWIFT_VERSIONS%% *}" \
      && mise cache clear || true \
      && rm -rf "$HOME/.cache/mise" "$HOME/.local/share/mise/downloads"; \
    else \
      echo "Skipping Swift install on $TARGETARCH"; \
    fi

### RUST ###

ARG RUST_VERSIONS="1.89.0 1.88.0 1.87.0 1.86.0 1.85.1 1.84.1 1.83.0"
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain none \
    && . "$HOME/.cargo/env" \
    && echo 'source $HOME/.cargo/env' >> /etc/profile \
    && rustup toolchain install $RUST_VERSIONS --profile minimal --component rustfmt --component clippy \
    && rustup default ${RUST_VERSIONS%% *}

### RUBY ###

ARG RUBY_VERSIONS="3.2.3 3.3.8 3.4.4"
RUN apt-get update && apt-get install -y --no-install-recommends \
    libyaml-dev=0.2.* \
    libgmp-dev=2:6.3.* \
    && rm -rf /var/lib/apt/lists/* \
    && for v in $RUBY_VERSIONS; do mise install "ruby@${v}"; done \
    && mise use --global "ruby@${RUBY_VERSIONS%% *}" \
    && mise cache clear || true \
    && rm -rf "$HOME/.cache/mise" "$HOME/.local/share/mise/downloads"

### C++ ###
# gcc is already installed via apt-get above, so these are just additional linters, etc.
RUN pipx install --pip-args="--no-cache-dir --no-compile" cpplint==2.0.* clang-tidy==20.1.* clang-format==20.1.* cmakelang==0.6.* \
    && rm -rf /root/.cache/pip ~/.cache/pip ~/.cache/pipx

### BAZEL ###

ARG BAZELISK_VERSION=v1.26.0

RUN curl -L --fail https://github.com/bazelbuild/bazelisk/releases/download/${BAZELISK_VERSION}/bazelisk-${TARGETOS}-${TARGETARCH} -o /usr/local/bin/bazelisk \
    && chmod +x /usr/local/bin/bazelisk \
    && ln -s /usr/local/bin/bazelisk /usr/local/bin/bazel

### GO ###

ARG GO_VERSIONS="1.25.1 1.24.3 1.23.8 1.22.12"
ARG GOLANG_CI_LINT_VERSION=2.1.6

# Go defaults GOROOT to /usr/local/go - we just need to update PATH
ENV PATH=/usr/local/go/bin:$HOME/go/bin:$PATH
RUN for v in $GO_VERSIONS; do mise install "go@${v}"; done \
    && mise use --global "go@${GO_VERSIONS%% *}" \
    && mise use --global "golangci-lint@${GOLANG_CI_LINT_VERSION}" \
    && mise cache clear || true \
    && rm -rf "$HOME/.cache/mise" "$HOME/.local/share/mise/downloads"

### PHP ###

ARG PHP_VERSIONS="8.5 8.4 8.3 8.2"
ARG COMPOSER_ALLOW_SUPERUSER=1
RUN apt-get update && apt-get install -y --no-install-recommends \
        autoconf=2.71-* \
        bison=2:3.8.* \
        libgd-dev=2.3.* \
        libedit-dev=3.1-* \
        libicu-dev=74.2-* \
        libjpeg-dev=8c-* \
        libonig-dev=6.9.* \
        libpng-dev=1.6.* \
        libpq-dev=16.10-* \
        libzip-dev=1.7.* \
        openssl=3.0.* \
        re2c=3.1-* \
    && rm -rf /var/lib/apt/lists/* \
    && for v in $PHP_VERSIONS; do mise install "php@${v}"; done \
    && mise use --global "php@${PHP_VERSIONS%% *}" \
    && mise cache clear || true \
    && rm -rf "$HOME/.cache/mise" "$HOME/.local/share/mise/downloads"

### ELIXIR ###

ARG ERLANG_VERSION=27.1.2
ARG ELIXIR_VERSION=1.18.3
RUN mise install "erlang@${ERLANG_VERSION}" "elixir@${ELIXIR_VERSION}-otp-27" \
    && mise use --global "erlang@${ERLANG_VERSION}" "elixir@${ELIXIR_VERSION}-otp-27" \
    && mise cache clear || true \
    && rm -rf "$HOME/.cache/mise" "$HOME/.local/share/mise/downloads"

### SETUP SCRIPTS ###

COPY setup_universal.sh /opt/codex/setup_universal.sh
RUN chmod +x /opt/codex/setup_universal.sh

### VERIFICATION SCRIPT ###

COPY verify.sh /opt/verify.sh
RUN chmod +x /opt/verify.sh && bash -lc "TARGETARCH=$TARGETARCH /opt/verify.sh"

### ENTRYPOINT ###

COPY entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh

ENTRYPOINT  ["/opt/entrypoint.sh"]
