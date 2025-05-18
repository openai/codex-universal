{ stdenv, lib, licenses }:

stdenv.mkDerivation rec {
  pname = "nvm";
  version = "v0.40.2";

  src = builtins.fetchGit {
    url = "https://github.com/nvm-sh/nvm";
    ref = version;
  };

  dontBuild = true;

  installPhase = ''
    mkdir -p $out
    cp -r $src/* $out/
  '';

  meta = with lib; {
    description = "Node Version Manager";
    homepage = "https://github.com/nvm-sh/nvm";
    license = licenses.mit;
    maintainers = [];
  };
}
