# Use the official Python image as a base
FROM python:3.12.2-slim

# Accept the build argument
ARG WHEEL

# Update the package list and install necessary packages including libgomp1
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgomp1 && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN python -m pip install --upgrade pip

# Set the working directory
WORKDIR /app

# Copy the wheel file and install it
COPY ./dist/$WHEEL /app/$WHEEL
RUN pip install --no-cache-dir --upgrade /app/$WHEEL

# Copy the source code into the image
COPY ./src /app/src

# Debug step: list installed packages and system libraries
RUN pip list
RUN ldconfig -p

# Install models with debug information
RUN python ./src/install_deps.py || { cat /app/src/install_deps.py; exit 1; }

# Expose the port the app runs on
EXPOSE 7860

# Set the PYTHONPATH environment variable
ENV PYTHONPATH="src"

# Command to run the application
CMD ["python", "-m", "src.server"]
