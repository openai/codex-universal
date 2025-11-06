#!/bin/bash --login

set -euo pipefail

echo "Verifying language runtimes ..."

echo "- Python:"
python3 --version
pyenv versions | sed 's/^/  /'

echo "- Node.js:"
export NVM_DIR="${NVM_DIR:-"$HOME/.nvm"}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
fi
export NVM_NO_COLORS=1
original_nvm_default="$(nvm alias --no-colors default 2>/dev/null | head -n 1 | awk '{print $3}')"
for version in "18" "20" "22"; do
    nvm use "${version}"
    node --version
    npm --version
    pnpm --version
    yarn --version
    npm ls -g
done
if [ -n "${original_nvm_default}" ] && [ "${original_nvm_default}" != "none" ]; then
    nvm alias default "${original_nvm_default}" >/dev/null
fi

echo "- Bun:"
bun --version

echo "- Java / Gradle:"
java -version
javac -version
gradle --version | head -n 3
mvn --version | head -n 1

if [ "$TARGETARCH" = "amd64" ]; then \
    echo "- Swift:"
    swift --version
fi

echo "- Ruby:"
ruby --version

echo "- Rust:"
rustc --version
cargo --version

echo "- Go:"
go version

echo "- PHP:"
php --version
composer --version

echo "- Elixir:"
elixir --version
erl -version
erl -eval 'erlang:display(erlang:system_info(otp_release)), halt().' -noshell

echo "All language runtimes detected successfully."
