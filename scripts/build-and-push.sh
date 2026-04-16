#!/bin/bash
# Buduje obraz Docker na Azure Container Registry (build w chmurze, nie lokalnie).
# Wymaga: az login, Azure CLI
#
# Użycie:
#   ./scripts/build-and-push.sh           → tag: latest
#   ./scripts/build-and-push.sh 1.0.0     → tag: 1.0.0

set -e

ACR_NAME="${ACR_NAME:-acrtheralink}"
IMAGE_NAME="theralink/frontend"
TAG="${1:-latest}"

echo "→ Budowanie obrazu na ACR: $ACR_NAME.azurecr.io/$IMAGE_NAME:$TAG"
echo "  (build wykonywany zdalnie na Azure — nie wymaga lokalnego Dockera)"

az acr build \
  --registry "$ACR_NAME" \
  --image "$IMAGE_NAME:$TAG" \
  --platform linux/amd64 \
  .

echo "✓ Obraz dostępny: $ACR_NAME.azurecr.io/$IMAGE_NAME:$TAG"