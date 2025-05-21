# codex-universal

`codex-universal` is a reference implementation of the base Docker image available in [OpenAI Codex](http://platform.openai.com/docs/codex).

This repository is intended to help developers cutomize environments in Codex, by providing a similar image that can be pulled and run locally. This is not an identical environment but should help for debugging and development.

For more details on environment setup, see [OpenAI Codex](http://platform.openai.com/docs/codex).

## Usage

The Docker image is available at:

```
docker pull ghcr.io/openai/codex-universal:latest
```

The below script shows how you can run the image locally:

```
docker run --rm -it \
    -v $(pwd):/workspace/$(basename $(pwd)) -w /workspace/$(basename $(pwd)) \
    ghcr.io/openai/codex-universal:latest
```

To build the image with a specific language version, use the `--build-arg` flag with `docker build`. For example, to build with the latest supported Python version (3.13):

```
docker build --build-arg PYTHON_VERSION=3.13 -t myimage .
```

Or, to build with .NET 9.0:

```
docker build --build-arg DOTNET_VERSION=9.0 -t myimage .
```

### Configuring language runtimes

The following build arguments can be set to configure which version is installed (see the Dockerfile for all options):

| Build argument      | Description                | Supported versions                               |
| -------------------| -------------------------- | ------------------------------------------------ |
| `PYTHON_VERSION`   | Python version to install  | `3.10`, `3.11.12`, `3.12`, `3.13`                |
| `NODE_VERSION`     | Node.js version to install | `18`, `20`, `22`                                 |
| `RUST_VERSION`     | Rust version to install    | `1.83.0`, `1.84.1`, `1.85.1`, `1.86.0`, `1.87.0` |
| `GO_VERSION`       | Go version to install      | `1.22.12`, `1.23.8`, `1.24.3`                    |
| `SWIFT_VERSION`    | Swift version to install   | `5.10`, `6.1`                                    |
| `DOTNET_VERSION`   | .NET SDK version to install| `9.0`                                            |

## What's included

In addition to the packages specified in the table above, the following packages are also installed:

- `ruby`: 3.2.3
- `bun`: 1.2.10
- `java`: 21
- `bazelisk` / `bazel`
- `dotnet`: 9.0

See [Dockerfile](Dockerfile) for the full details of installed packages.
