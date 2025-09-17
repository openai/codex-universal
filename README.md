# codex-cli-base

`codex-cli-base` is a minimal Docker base image for running the [OpenAI Codex CLI](https://www.npmjs.com/package/@openai/codex).

This repository provides a lightweight Ubuntu-based Docker image with Node.js and the @openai/codex CLI tool pre-installed.

## Usage

The Docker image is available at:

```
docker pull ghcr.io/benyaminsalimi/codex-sandbox:latest
```

You can also pull a specific version tagged with the @openai/codex npm version:

```
docker pull ghcr.io/benyaminsalimi/codex-sandbox:0.36.0
```

This repository builds the image for both linux/amd64 and linux/arm64.

### Running the container

```sh
docker run --rm -it \
    -v $(pwd):/workspace/$(basename $(pwd)) -w /workspace/$(basename $(pwd)) \
    ghcr.io/benyaminsalimi/codex-sandbox:latest
```

### Using the Codex CLI

Once inside the container, you can use the Codex CLI:

```sh
codex --help
codex --version
```

## What's included

- **Ubuntu 24.04** base image
- **Node.js** (from Ubuntu repository) with npm
- **@openai/codex** CLI tool (latest version)
- Essential development tools: git, curl, wget, jq, make, openssh-client, unzip, zip

## Image Tags

- `latest` - Latest build from main branch
- `<version>` - Tagged with the @openai/codex npm package version (e.g., `0.36.0`)
- `<sha>` - Tagged with git commit SHA

## Development Notes

This image is dramatically simplified from the original `codex-universal` image, reducing from 301 lines to ~47 lines in the Dockerfile (84% reduction). It focuses solely on providing a minimal environment for the Codex CLI rather than supporting multiple programming languages and runtimes.

To complete the setup in a production environment, replace the placeholder installation in the Dockerfile with:
```dockerfile
RUN npm install -g @openai/codex
```
