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
          mkdir -p $out/opt/codex
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
          packages = with pkgs; [ nix docker-compose ];
          shellHook = ''
            export NIX_CONFIG="experimental-features = nix-command flakes"
          '';
        };
      });
}
