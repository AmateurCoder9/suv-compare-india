# SUV Compare India 2026 — Image Downloader

This Python 3 script automatically crawls official manufacturer websites, press rooms, and media portals to download high-quality images of specific Indian SUVs under ₹20 lakh. 

It organizes the downloaded assets into categorized folders, checks for duplicates, validates image dimensions, creates a metadata file for each model, and packages the result into a ZIP file.

## Setup Instructions

1. **Prerequisites**: Ensure you have Python 3.8 or higher installed on your system.
2. **Install Dependencies**: Install the required packages using pip:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Downloader

Execute the script from the root directory:
```bash
python download_suv_images.py
```

## Features

* **Official Sources Only**: Uses only official manufacturer websites, media, and press center domains. Does not scrape Google Images.
* **Auto-Resilient**: Fails gracefully if a manufacturer changes their site structure, gets blocked, or requires Javascript. It logs the issue and proceeds to the next SUV.
* **Smart Filtering**: Filters out thumbnails, logos, and icons by enforcing a minimum image size of `800x600` via Pillow image header checks.
* **Metadata Logging**: Saves a `metadata.json` in each car folder containing the download date, original file size, source page, and URL.
* **Deduplication**: Prevents duplicate downloads by calculating SHA-256 hashes of each image before saving.
* **ZIP Generation**: Creates a structured `SUV_Compare_India_2026.zip` file automatically upon completion.
