#!/usr/bin/env bash
set -euo pipefail

# Enable Corepack and make pnpm available for JS/TS workspaces.
corepack enable || true
corepack prepare pnpm@latest --activate || true

python -m pip install --upgrade pip uv

# `uv sync` necesita un pyproject.toml; el repo aún no tiene uno (llegará con el primer servicio Python).
# Sin esta guarda el script aborta (set -e) y Codespaces se crea con error.
if [ -f pyproject.toml ]; then
  uv sync
fi

echo "Devcontainer setup complete."
