{
  description = "Codex universal container using Nix";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        # removed nvm; Node.js version pinned via nodejs_22

        envPackages = with pkgs; [
          bashInteractive
          git
          git-lfs
          curl
          jq
          gnupg
          ripgrep
          rsync
          unzip
          zip
          pyenv
          pipx
          python311Full
          nodejs_22
          bun
          jdk21
          ruby_3_2
          rustup
          go_1_23
          swift
          bazelisk
          nix
        ];

        codexScripts = pkgs.runCommand "codex-scripts" {} ''
          mkdir -p $out/opt/codex
          cp ${./setup_universal.sh} $out/opt/codex/setup_universal.sh
          chmod +x $out/opt/codex/setup_universal.sh
          cp ${./entrypoint.sh} $out/opt/codex/entrypoint.sh
          chmod +x $out/opt/codex/entrypoint.sh
        '';

      in {
        packages.dockerImage = pkgs.dockerTools.buildLayeredImage {
          name = "codex-universal";
          contents = envPackages ++ [ codexScripts ];
          config = {
            Entrypoint = [ "/opt/codex/entrypoint.sh" ];
            Env = [ "NIX_CONFIG=experimental-features\ =\ nix-command\ flakes" ];
          };
        };

        devShells.default = pkgs.mkShell {
          packages =
            with pkgs;
            [
              nix
              docker-compose
              # Core unix utilities
              coreutils
              findutils
              gnused
              gnugrep
              gawk
              # Essential development tools
              git
              curl
              wget
              jq
              ripgrep
              tree
              htop
              # Editor
              vim
              # Build tools
              gnumake
              cmake
              pkg-config
              # Compression tools
              zip
              unzip
              gzip
              # Process management
              procps
              ps
              # Language runtimes for development
              python311
              nodejs_22
              go_1_23
              rustup
              ruby_3_2
              # Python tools
              pyenv
              pipx
              poetry
              ruff
              # Node tools
              yarn
              pnpm
              # Other dev tools
              docker
              docker-client
            ];

          shellHook = ''
            export NIX_CONFIG="experimental-features = nix-command flakes"
            echo "Development environment loaded."
            echo ""
            echo "Available Nix tools:"
            echo "  - nixfmt, statix, nil, nom"
            echo "  - Run 'nix flake check' to run all checks"
            echo ""
            echo "Development tools:"
            echo "  - Core utilities: ls, cat, grep, find, etc."
            echo "  - VCS: git, git-lfs"
            echo "  - Network: curl, wget, jq"
            echo "  - Search: ripgrep, grep"
            echo "  - Build: make, cmake, pkg-config"
            echo "  - Containers: docker, docker-compose"
            echo ""
            echo "Language runtimes:"
            echo "  - Python 3.11 (pyenv, pipx, poetry, ruff)"
            echo "  - Node.js 22 (yarn, pnpm)"
            echo "  - Go 1.23"
            echo "  - Rust (via rustup)"
            echo "  - Ruby 3.2"
          '';
        };
      });
  }
