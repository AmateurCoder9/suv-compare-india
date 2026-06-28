# SUV Image Scraper

This script automates the downloading of high-quality SUV images from official manufacturer websites (or Google Images fallback) for the SUV Compare India 2026 platform.

## Setup

1. Make sure you have Python 3.8+ installed.
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Running the Script

Simply run the Python file:

```bash
python download_suv_images.py
```

## Features

- Downloads high-quality images and filters out small icons/logos.
- Prevents duplicate downloads using SHA-256 hashing.
- Retries failed downloads automatically.
- Validates downloaded files using Pillow.
- Generates `metadata.json` for each car.
- Zips all downloaded content into `SUV_Compare_India_2026.zip` automatically upon completion.
