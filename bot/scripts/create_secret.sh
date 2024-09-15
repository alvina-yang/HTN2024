#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

# Set Fly secrets
fly secrets set \
  DAILY_API_KEY=$DAILY_API_KEY \
  ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY \
  ELEVENLABS_VOICE_ID=$ELEVENLABS_VOICE_ID \
  OPENAI_API_KEY=$OPENAI_API_KEY \
  FLY_API_KEY=$FLY_API_KEY \
  FLY_APP_NAME=$FLY_APP_NAME \
  DEEPGRAM_API_KEY=$DEEPGRAM_API_KEY \
