#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

# Source the set_wheel.sh script to get its exports
source ./scripts/set_wheel.sh

echo "WHEEL: $WHEEL"
echo "WHEEL_VERSION: $WHEEL_VERSION"

# Deploy with the WHEEL build argument
fly deploy --build-arg WHEEL=$WHEEL \
  --build-arg DAILY_API_KEY=$DAILY_API_KEY \
  --build-arg ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY \
  --build-arg ELEVENLABS_VOICE_ID=$ELEVENLABS_VOICE_ID \
  --build-arg OPENAI_API_KEY=$OPENAI_API_KEY \
  --build-arg FLY_API_KEY=$FLY_API_KEY \
  --build-arg FLY_APP_NAME=$FLY_APP_NAME \
