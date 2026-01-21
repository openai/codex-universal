# codex-universal

`codex-universal` is a reference implementation of the base Docker image available in [OpenAI Codex](http://platform.openai.com/docs/codex).

This repository is intended to help developers cutomize environments in Codex, by providing a similar image that can be pulled and run locally. This is not an identical environment but should help for debugging and development.

For more details on environment setup, see [OpenAI Codex](http://platform.openai.com/docs/codex).

## Usage

The Docker image is available at:

```
docker pull ghcr.io/openai/codex-universal:latest
```

This repository builds the image for both linux/amd64 and linux/arm64. However we only run the linux/amd64 version.
Your installed Docker may support linux/amd64 emulation by passing the `--platform linux/amd64` flag.

The arm64 image differs from the amd64 image in 2 ways:
- OpenJDK 10 is not available on amd64
- The arm64 image skips installing swift because of a current bug with mise

The below script shows how can you approximate the `setup` environment in Codex:

```sh
# See below for environment variable options.
# This script mounts the current directory similar to how it would get cloned in.
docker run --rm -it \
    -e CODEX_ENV_PYTHON_VERSION=3.12 \
    -e CODEX_ENV_NODE_VERSION=20 \
    -e CODEX_ENV_RUST_VERSION=1.87.0 \
    -e CODEX_ENV_GO_VERSION=1.23.8 \
    -e CODEX_ENV_SWIFT_VERSION=6.2 \
    -e CODEX_ENV_RUBY_VERSION=3.4.4 \
    -e CODEX_ENV_PHP_VERSION=8.4 \
    -v $(pwd):/workspace/$(basename $(pwd)) -w /workspace/$(basename $(pwd)) \
    ghcr.io/openai/codex-universal:latest
```

`codex-universal` includes setup scripts that look for `CODEX_ENV_*` environment variables and configures the language version accordingly.

### Configuring language runtimes

The following environment variables can be set to configure runtime installation. Note that a limited subset of versions are supported (indicated in the table below):

| Environment variable       | Description                | Supported versions                               | Additional packages                                                  |
| -------------------------- | -------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| `CODEX_ENV_PYTHON_VERSION` | Python version to install  | `3.10`, `3.11.12`, `3.12`, `3.13`, `3.14.0`        | `pyenv`, `poetry`, `uv`, `ruff`, `black`, `mypy`, `pyright`, `isort` |
| `CODEX_ENV_NODE_VERSION`   | Node.js version to install | `18`, `20`, `22`                                 | `corepack`, `yarn`, `pnpm`, `npm`                                    |
| `CODEX_ENV_RUST_VERSION`   | Rust version to install    | `1.83.0`, `1.84.1`, `1.85.1`, `1.86.0`, `1.87.0`, `1.88.0`, `1.89.0`, `1.90`, `1.91.1`, `1.92.0` |                                                                      |
| `CODEX_ENV_GO_VERSION`     | Go version to install      | `1.22.12`, `1.23.8`, `1.24.3`, `1.25.1`           |                                                                      |
| `CODEX_ENV_SWIFT_VERSION`  | Swift version to install   | `5.10`, `6.1`, `6.2`                              |                                                                      |
| `CODEX_ENV_RUBY_VERSION`   | Ruby version to install  | `3.2.3`, `3.3.8`, `3.4.4`                |                                                                      |
| `CODEX_ENV_PHP_VERSION`   | PHP version to install  | `8.4`, `8.3`, `8.2`                |                                                                      |
| `CODEX_ENV_JAVA_VERSION`   | JDK version to install  | `25`, `24`, `23`, `22`, `21`, `17`, `11`                |                                                                      |



## What's included

In addition to the packages specified in the table above, the following packages are also installed:

- `bun`: 1.2.10
- `bazelisk` / `bazel`
- `erlang`: 27.1.2
- `elixir`: 1.18.3

See [Dockerfile](Dockerfile) for the full details of installed packages.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
