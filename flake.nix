{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs,
    ...
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
    devPackages = with pkgs; [
      nodejs
      # ts-node is used by your 'start:backend' script.
      nodePackages.ts-node
    ];
  in {
    devShells.${system}.default = pkgs.mkShell {
      name = "c8n-dev-shell";
      packages = devPackages;
      shellHook = ''
        echo "Entering c8n dev shell."
      '';
    };
  };
}
