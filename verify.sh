#!/bin/bash --login

set -euo pipefail

echo "Verifying language runtimes ..."

echo "- Python:"
python3 --version
pyenv versions | sed 's/^/  /'

echo "- Node.js:"
for version in "18" "20" "22"; do
    nvm use --global "${version}"
    node --version
    npm --version
    pnpm --version
    yarn --version
    npm ls -g
done

echo "- Bun:"
bun --version

echo "- Java / Gradle:"
java -version
javac -version
gradle --version | head -n 3
mvn --version | head -n 1

echo "- Swift:"
swift --version

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
