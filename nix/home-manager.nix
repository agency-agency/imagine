{ mkConfig }:
{ config, lib, pkgs, ... }:
let
  cfg = config.programs.imagine;
  checked = mkConfig { inherit pkgs; inherit (cfg) configSource; };
in {
  options.programs.imagine = {
    enable = lib.mkEnableOption "Imagine's checked Domicile configuration";
    configSource = lib.mkOption {
      type = lib.types.path;
      default = ../examples/domicile.tsx;
      description = "Host-owned TSX entry importing Imagine from ./imagine/src/index.";
    };
    prebuilt = lib.mkOption {
      type = lib.types.bool;
      default = true;
      description = "Install the prebuilt shell and JSON, avoiding a first-login bundle.";
    };
    checkedPackage = lib.mkOption {
      type = lib.types.package;
      readOnly = true;
      default = checked;
      description = "The exact checked source graph and prebuilt shell.";
    };
  };
  config = lib.mkIf cfg.enable {
    # Do not also enable upstream's Domicile Home Manager config writer: there
    # must be only one of domicile.json and domicile.tsx at a time.
    xdg.configFile = if cfg.prebuilt then {
      "domicile/domicile.json".source = "${checked}/domicile.json";
    } else {
      "domicile/domicile.tsx".source = "${checked}/domicile.tsx";
      "domicile/imagine".source = "${checked}/imagine";
    };
  };
}
