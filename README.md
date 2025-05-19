# codex-universal

`codex-universal` is a reference implementation of the base Docker image available in [OpenAI Codex](http://platform.openai.com/docs/codex).

This repository is intended to help developers customize environments in Codex, by providing a similar image that can be pulled and run locally. This is not an identical environment but should help for debugging and development.

For more details on environment setup, see [OpenAI Codex](http://platform.openai.com/docs/codex).

## Development with nix-portable

[nix-portable](https://github.com/DavHau/nix-portable) allows you to run Nix on any Linux system without root privileges or installation. This is the recommended approach for quick development and testing.

### Using the development shell

First, download and make nix-portable executable:

```sh
curl -L https://github.com/DavHau/nix-portable/releases/latest/download/nix-portable-$(uname -m) > ./nix-portable
chmod +x ./nix-portable
```

Enter the development shell:

```sh
./nix-portable nix develop
```

The development shell includes:
- Core Unix utilities (ls, grep, find, etc.)
- Development tools (git, curl, jq, ripgrep, vim)
- Language runtimes (Python 3.11, Node.js 22, Go 1.23, Rust, Ruby 3.2)
- Language-specific tools (pyenv, pipx, poetry, ruff, yarn, pnpm)
- Container tools (docker, docker-compose)

### Building the Docker image

You can build the Docker image using nix-portable:

```sh
# Build the Docker image
./nix-portable nix build .#dockerImage

# Load the image into Docker
docker load < result

# Run the loaded image
docker run --rm -it codex-universal:latest
```

## Usage

The Docker image is available at:

```
docker pull ghcr.io/openai/codex-universal:latest
```

The below script shows how can you approximate the `setup` environment in Codex:

```
docker run --rm -it \
    # See below for environment variable options.
    -e CODEX_ENV_PYTHON_VERSION=3.12 \
    -e CODEX_ENV_NODE_VERSION=20 \
    -e CODEX_ENV_RUST_VERSION=1.87.0 \
    -e CODEX_ENV_GO_VERSION=1.23.8 \
    -e CODEX_ENV_SWIFT_VERSION=6.1 \
    # Mount the current directory similar to how it would get cloned in.
    -v $(pwd):/workspace/$(basename $(pwd)) -w /workspace/$(basename $(pwd)) \
    ghcr.io/openai/codex-universal:latest
```

`codex-universal` includes setup scripts that look for `CODEX_ENV_*` environment variables and configures the language version accordingly.

### Configuring language runtimes

The following environment variables can be set to configure runtime installation. Note that a limited subset of versions are supported (indicated in the table below):

| Environment variable       | Description                | Supported versions                               | Additional packages                                                  |
| -------------------------- | -------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| `CODEX_ENV_PYTHON_VERSION` | Python version to install  | `3.10`, `3.11.12`, `3.12`, `3.13`                | `pyenv`, `poetry`, `uv`, `ruff`, `black`, `mypy`, `pyright`, `isort` |
| `CODEX_ENV_NODE_VERSION`   | Node.js version (info only)| Currently pinned to `22` in Nix build            | `corepack`, `yarn`, `pnpm`, `npm`                                    |
| `CODEX_ENV_RUST_VERSION`   | Rust version to install    | `1.83.0`, `1.84.1`, `1.85.1`, `1.86.0`, `1.87.0` |                                                                      |
| `CODEX_ENV_GO_VERSION`     | Go version to install      | `1.22.12`, `1.23.8`, `1.24.3`                    |                                                                      |
| `CODEX_ENV_SWIFT_VERSION`  | Swift version to install   | `5.10`, `6.1`                                    |                                                                      |

## What's included

In addition to the packages specified in the table above, the following packages are also installed:

- `pyenv`
- `pipx`
- `ruby`: 3.2.3
- `bun`: 1.2.10
- `java`: 21
- `bazelisk` / `bazel`

Note: Node.js is now directly installed via Nix (version 22) rather than using `nvm`.

See [Dockerfile](Dockerfile) for the full details of installed packages.

## Building with Nix

You can build an equivalent image using [Nix](https://nixos.org/). While the Dockerfile remains the primary way to build the container image, the repository also ships a Flake that offers a reproducible development environment. Ensure `nix` is installed with flakes enabled.

The Flake lockfile `flake.lock` should be kept current. Run `nix flake lock` when dependencies change to update it.

To build the image:

```bash
nix build .#dockerImage
```

The resulting `result` symlink can be loaded with Docker:

```bash
docker load < result
```

A development shell with the required tools can be entered with:

```bash
nix develop
```

The shell sets `NIX_CONFIG="experimental-features = nix-command flakes"`, so the `nix-command` and `flakes` features are enabled by default.

The repository's Nix flake produces a `flake.lock` file to pin dependencies.
This file is automatically kept up to date through GitHub Actions:
- A weekly workflow checks for updates and creates pull requests
- Updates are triggered automatically when `flake.nix` changes
- Pull requests are validated to ensure `flake.lock` is current

### direnv integration

The repository includes a `.envrc` file for [direnv](https://direnv.net/). After installing `direnv`, run `direnv allow` in the repository root. Each new shell will automatically enter the `nix develop` environment.

### Customizing flake inputs

`nix develop` and `nix build` support `--override-input` to use alternative flake sources. For example, to try a different `nixpkgs` revision:

```bash
nix develop --override-input nixpkgs github:NixOS/nixpkgs/nixos-unstable
```

Nix-related environment variables can also be set as needed, such as:

```bash
NIX_PATH=nixpkgs=./nixpkgs nix build
```

## AI Assistant Guidance

This repository includes an `AGENT.md` file that provides guidance for AI assistants working with the codebase. To integrate with different AI tools, you can create symlinks to this file:

```bash
# For tools expecting AGENTS.md
ln -s AGENT.md AGENTS.md

# For other common naming conventions
ln -s AGENT.md AI.md
ln -s AGENT.md ASSISTANT.md
```

The guidance file includes:
- Project architecture overview
- Common commands and workflows
- Language version configuration details
- Build process documentation

Refer to `AGENT.md` for the complete details.
