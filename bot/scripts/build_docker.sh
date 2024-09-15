#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

source ./scripts/set_wheel.sh

echo "WHEEL: $WHEEL"
echo "WHEEL_VERSION: $WHEEL_VERSION"

# Build the Docker image with the latest wheel
docker build --no-cache \
  --build-arg WHEEL=$WHEEL \
  --build-arg DAILY_API_KEY=$DAILY_API_KEY \
  --build-arg ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY \
  --build-arg ELEVENLABS_VOICE_ID=$ELEVENLABS_VOICE_ID \
  --build-arg OPENAI_API_KEY=$OPENAI_API_KEY \
  --build-arg FLY_API_KEY=$FLY_API_KEY \
  --build-arg FLY_APP_NAME=$FLY_APP_NAME \
  -t terifai:$WHEEL_VERSION -t terifai:latest .
