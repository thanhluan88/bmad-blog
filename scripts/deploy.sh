#!/usr/bin/env bash
# Deploy blog to Cloud Run with Cloud SQL connectivity.
# Prerequisites: gcloud CLI, Docker, Cloud SQL instance, Artifact Registry repo.
#
# Usage:
#   export GCP_PROJECT_ID=my-project
#   export GCP_REGION=us-central1
#   export SERVICE_NAME=blog
#   export CLOUD_SQL_CONNECTION=my-project:us-central1:my-instance
#   ./scripts/deploy.sh
#
# Or run migrations first (with DATABASE_URL pointing to Cloud SQL):
#   ./scripts/migrate-deploy.sh
#   ./scripts/deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

GCP_PROJECT_ID="${GCP_PROJECT_ID:-}"
GCP_REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-blog}"
CLOUD_SQL_CONNECTION="${CLOUD_SQL_CONNECTION:-}"
IMAGE_NAME="${IMAGE_NAME:-${SERVICE_NAME}}"

if [[ -z "$GCP_PROJECT_ID" ]]; then
  echo "Error: GCP_PROJECT_ID is required. Set it or pass as env var."
  exit 1
fi

if [[ -z "$CLOUD_SQL_CONNECTION" ]]; then
  echo "Warning: CLOUD_SQL_CONNECTION not set. Cloud Run will not attach Cloud SQL."
  echo "Set CLOUD_SQL_CONNECTION (e.g. project:region:instance) for DB connectivity."
fi

ARTIFACT_REGISTRY="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${SERVICE_NAME}/${IMAGE_NAME}"
IMAGE_TAG="${ARTIFACT_REGISTRY}:$(date +%Y%m%d-%H%M%S)"

echo "Building image..."
cd "$ROOT_DIR"
docker build -t "$IMAGE_TAG" .

echo "Pushing to Artifact Registry..."
docker push "$IMAGE_TAG"

DEPLOY_ARGS=(
  "run"
  "deploy" "$SERVICE_NAME"
  "--image" "$IMAGE_TAG"
  "--platform" "managed"
  "--region" "$GCP_REGION"
  "--allow-unauthenticated"
  "--memory" "512Mi"
  "--set-env-vars" "NODE_ENV=production,AUTH_TRUST_HOST=true"
)

if [[ -n "$CLOUD_SQL_CONNECTION" ]]; then
  DEPLOY_ARGS+=(--add-cloudsql-instances "$CLOUD_SQL_CONNECTION")
fi

echo "Deploying to Cloud Run..."
echo ""
echo "Before first deploy, create Artifact Registry repo:"
echo "  gcloud artifacts repositories create $SERVICE_NAME --repository-format=docker --location=$GCP_REGION"
echo ""
echo "Set DATABASE_URL, AUTH_SECRET, GCS_BUCKET via Cloud Run console or:"
echo "  gcloud run services update $SERVICE_NAME --region=$GCP_REGION --set-secrets=DATABASE_URL=db-url:latest,AUTH_SECRET=auth-secret:latest --set-env-vars=GCS_BUCKET=your-bucket"
echo ""
gcloud "${DEPLOY_ARGS[@]}"

echo "Done. Service URL: $(gcloud run services describe $SERVICE_NAME --region=$GCP_REGION --format='value(status.url)')"
