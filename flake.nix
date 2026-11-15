{
  description = "Imagine, a standalone desktop shell for Domicile";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/d5cc6833999746cffdfe0598f7bc801a57b887a9";
    # Keep the SDK, builder and engine selected by this flake together.
    domicile.url = "github:cprussin/domicile/8115d932b41be551ca7769fc2e89e323e5692c8c";
  };

  outputs = inputs@{ self, nixpkgs, domicile }:
    let
      systems = [ "x86_64-linux" ];
      eachSystem = nixpkgs.lib.genAttrs systems;
      sourceFor = pkgs: lib.cleanSourceWith {
        name = "imagine-production";
        src = self;
        filter = path: type:
          let
            root = toString self;
            relative = if path == root then "" else lib.removePrefix "${root}/" path;
          in (
            relative == "" || relative == "src" || lib.hasPrefix "src/" relative
            || builtins.elem relative [ "package.json" "LICENSE" ]
          ) && !(lib.hasSuffix ".test.ts" path || lib.hasSuffix ".test.tsx" path);
      };
      inherit (nixpkgs) lib;
      mkConfig = { pkgs, configSource ? ./examples/domicile.tsx,
        domicilePackage ? domicile.packages.${pkgs.stdenv.hostPlatform.system}.domicile,
        source ? sourceFor pkgs }:
        import ./nix/config.nix { inherit pkgs configSource domicilePackage source; };
    in {
      lib = { inherit mkConfig; source = sourceFor; };
      packages = eachSystem (system:
        let pkgs = nixpkgs.legacyPackages.${system};
        in rec {
          source = pkgs.runCommand "imagine-source" { } ''
            cp -R ${sourceFor pkgs} "$out"
          '';
          default = mkConfig { inherit pkgs; };
          shell = default;
        });
      checks = eachSystem (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          desktop = domicile.packages.${system};
        in {
          config = self.packages.${system}.default;
          provenance = pkgs.runCommand "imagine-source-provenance" { nativeBuildInputs = [ pkgs.python3 ]; } ''
            python3 ${./tools/verify-source.py} ${self}
            touch "$out"
          '';
          unit = import ./nix/tests.nix {
            inherit pkgs;
            source = self;
            builder = desktop.builder;
            bun = domicile.legacyPackages.${system}.bun;
          };
        });
      homeManagerModules.default = import ./nix/home-manager.nix { inherit mkConfig; };
      nixosModules.default = { config, lib, pkgs, ... }: {
        imports = [ domicile.nixosModules.default ];
        options.programs.imagine.enable = lib.mkEnableOption "Domicile for an Imagine desktop";
        config = lib.mkIf config.programs.imagine.enable {
          programs.domicile.enable = true;
        };
      };
      devShells = eachSystem (system:
        let pkgs = nixpkgs.legacyPackages.${system};
        in { default = pkgs.mkShell {
          packages = [ pkgs.git pkgs.jq pkgs.python3 domicile.legacyPackages.${system}.bun ];
        }; });
      formatter = eachSystem (system: nixpkgs.legacyPackages.${system}.nixfmt);
    };
}
