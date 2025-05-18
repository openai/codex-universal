# codex-universal

`codex-universal` is a reference implementation of the base Docker image available in [OpenAI Codex](http://platform.openai.com/docs/codex).

This repository is intended to help developers customize environments in Codex, by providing a similar image that can be pulled and run locally. This is not an identical environment but should help for debugging and development.

For more details on environment setup, see [OpenAI Codex](http://platform.openai.com/docs/codex).

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
| `CODEX_ENV_NODE_VERSION`   | Node.js version to install | `18`, `20`, `22`                                 | `corepack`, `yarn`, `pnpm`, `npm`                                    |
| `CODEX_ENV_RUST_VERSION`   | Rust version to install    | `1.83.0`, `1.84.1`, `1.85.1`, `1.86.0`, `1.87.0` |                                                                      |
| `CODEX_ENV_GO_VERSION`     | Go version to install      | `1.22.12`, `1.23.8`, `1.24.3`                    |                                                                      |
| `CODEX_ENV_SWIFT_VERSION`  | Swift version to install   | `5.10`, `6.1`                                    |                                                                      |

## What's included

In addition to the packages specified in the table above, the following packages are also installed:

- `pyenv`
- `pipx`
- `nvm` (installed via the flake from the official git repo)
- `ruby`: 3.2.3
- `bun`: 1.2.10
- `java`: 21
- `bazelisk` / `bazel`

The flake fetches `nvm` from the official Git repository, ensuring the expected version is available in the image.

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

The shell sets `NIX_CONFIG="experimental-features = nix-command flakes"`,
so the `nix-command` and `flakes` features are enabled by default.

The repository's Nix flake produces a `flake.lock` file to pin dependencies.
Make sure this file stays up to date. A workflow (`update-flake-lock.yml`)
is provided to automatically regenerate and commit `flake.lock`.

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

### Automatic shell activation with direnv

If you use [direnv](https://direnv.net/) the development shell can be loaded automatically. Run `direnv allow` once in this directory to trust the `.envrc` file.

