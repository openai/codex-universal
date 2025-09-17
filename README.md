# codex-cli-base

`codex-cli-base` is a minimal Docker base image for running the [OpenAI Codex CLI](https://www.npmjs.com/package/@openai/codex).

This repository provides a lightweight Ubuntu-based Docker image with Node.js and the @openai/codex CLI tool pre-installed.

## Usage

The Docker image is available at:

```
docker pull benyamin/codex-sandbox:latest
```

You can also pull a specific version tagged with the @openai/codex npm version:

```
docker pull benyamin/codex-sandbox:0.36.0
```

This repository builds the image for both linux/amd64 and linux/arm64.

### Running the Docker Image

#### Quick Start

Run the container interactively with your current directory mounted:

```sh
docker run --rm -it \
    -v $(pwd):/workspace/$(basename $(pwd)) -w /workspace/$(basename $(pwd)) \
    benyamin/codex-sandbox:latest
```

#### Common Usage Patterns

**1. Run a single Codex command:**
```sh
docker run --rm \
    -v $(pwd):/workspace \
    -w /workspace \
    benyamin/codex-sandbox:latest \
    codex --version
```

**2. Interactive development session:**
```sh
docker run --rm -it \
    -v $(pwd):/workspace/project \
    -w /workspace/project \
    -e OPENAI_API_KEY=$OPENAI_API_KEY \
    benyamin/codex-sandbox:latest
```

**3. Non-interactive/CI mode:**
```sh
docker run --rm \
    -v $(pwd):/workspace \
    -w /workspace \
    -e OPENAI_API_KEY=$OPENAI_API_KEY \
    benyamin/codex-sandbox:latest \
    sh -c "codex login --api-key \$OPENAI_API_KEY && codex exec --full-auto 'update CHANGELOG for next release'"
```

**4. Resume previous session:**
```sh
docker run --rm \
    -v $(pwd):/workspace \
    -v ~/.codex:/root/.codex \
    -w /workspace \
    -e OPENAI_API_KEY=$OPENAI_API_KEY \
    benyamin/codex-sandbox:latest \
    codex exec "continue the task" resume --last
```

#### CI/CD Integration Examples

**GitHub Actions:**
```yaml
- name: Update changelog via Codex
  run: |
    docker run --rm \
      -v ${{ github.workspace }}:/workspace \
      -w /workspace \
      -e OPENAI_API_KEY="${{ secrets.OPENAI_KEY }}" \
      benyamin/codex-sandbox:latest \
      sh -c "codex login --api-key \$OPENAI_API_KEY && codex exec --full-auto 'update CHANGELOG for next release'"
```

**GitLab CI:**
```yaml
codex_analysis:
  script:
    - docker run --rm 
        -v $PWD:/workspace 
        -w /workspace 
        -e OPENAI_API_KEY=$OPENAI_API_KEY 
        benyamin/codex-sandbox:latest 
        sh -c "codex login --api-key $OPENAI_API_KEY && codex exec --full-auto 'analyze code quality and generate report'"
```

### Using as a Base Image

This image is designed to be used as a base for your own Docker images that need the Codex CLI:

```dockerfile
FROM benyamin/codex-sandbox:latest

# Add your application files
COPY . /app
WORKDIR /app

#application related logic 

# Set your entrypoint to run codex inside the docker 
CMD ["your-application"]
```

#### Example: CI/CD Integration

```dockerfile
FROM benyamin/codex-sandbox:latest

# Copy your project
COPY . /workspace
WORKDIR /workspace

# Run code analysis as part of your pipeline
RUN codex --api-key {}analyze src/ > analysis-report.txt
```

#### Example: Development Environment

```dockerfile
FROM benyamin/codex-sandbox:latest

# Install additional development tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set up your development environment
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Set working directory
WORKDIR /workspace
```

### Using the Codex CLI

This image comes with the [@openai/codex CLI](https://www.npmjs.com/package/@openai/codex) pre-installed. For comprehensive documentation on how to use the Codex CLI, including all available commands, configuration options, and advanced features, please refer to the [official Codex CLI documentation](https://www.npmjs.com/package/@openai/codex).

## Production Security Checklist

⚠️ **For production deployments, ensure you:**

- [ ] **Never run as root user** - Use `--user $(id -u):$(id -g)` or create non-root user in Dockerfile
- [ ] **Implement proper network sandboxing** - Restrict network access with firewall rules
- [ ] **Use secure secret management** - Never hardcode API keys, use Docker secrets or external systems
- [ ] **Apply container security hardening** - Drop unnecessary capabilities, use read-only filesystems where possible
- [ ] **Monitor and audit container access** - Log all container interactions and API usage

**Note**: This image includes `CODEX_UNSAFE_ALLOW_NO_SANDBOX=1` for container compatibility. Implement additional security layers in production.

## What's included

- **Ubuntu 24.04** base image
- **Node.js 24** (from NodeSource repository) with npm
- **@openai/codex** CLI tool (configurable version via build arg)
- Essential development tools: aggregate, ca-certificates, curl, dnsutils, fzf, gh, git, gnupg2, iproute2, ipset, iptables, jq, less, man-db, procps, unzip, ripgrep, zsh
- Proper npm global configuration for container environment
- Pre-configured environment variables for Codex CLI compatibility

## Image Tags

- `latest` - Latest build from main branch
- `<version>` - Tagged with the @openai/codex npm package version (e.g., `0.36.0`)
- `<sha>` - Tagged with git commit SHA

## Building the Docker Image

### Prerequisites

- Docker installed and running
- Git (for cloning the repository)

### Build from Source

1. Clone the repository:
```sh
git clone https://github.com/benyaminsalimi/codex-sandbox.git
cd codex-sandbox
```

2. Build the image with the latest Codex version:
```sh
docker build -t codex-sandbox:latest .
```

3. Build with a specific Codex version:
```sh
docker build --build-arg CODEX_VERSION=0.36.0 -t codex-sandbox:0.36.0 .
```

### Build Arguments

The Dockerfile supports the following build arguments:

- `CODEX_VERSION` - Specify the version of @openai/codex to install (default: `latest`)

Example:
```sh
docker build --build-arg CODEX_VERSION=0.35.0 -t codex-sandbox:custom .
```

## Development Notes

This image is dramatically simplified from the original `codex-universal` image, reducing from 301 lines to ~47 lines in the Dockerfile (84% reduction). It focuses solely on providing a minimal environment for the Codex CLI rather than supporting multiple programming languages and runtimes.

### Docker Image Details

The Dockerfile creates a minimal Ubuntu 24.04-based image with:
- Node.js 24 installed from the official NodeSource repository
- @openai/codex CLI tool installed globally via npm
- Essential development tools and utilities
- Proper npm global configuration for multi-user access
- Environment variable `CODEX_UNSAFE_ALLOW_NO_SANDBOX=1` set for container compatibility
