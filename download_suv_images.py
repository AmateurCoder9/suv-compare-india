import os
import re
import json
import hashlib
import time
import zipfile
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup
from PIL import Image
from tqdm import tqdm
from io import BytesIO

# --- Configuration & Constants ---
OUTPUT_DIR = "SUV_Compare_India_2026"
ZIP_FILENAME = "SUV_Compare_India_2026.zip"
MIN_WIDTH = 800
MIN_HEIGHT = 600
MAX_RETRIES = 3
TIMEOUT_SECONDS = 15

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Mapping of cars to their official model homepages, galleries, or press centers
OFFICIAL_SOURCES = {
    "Kia_Seltos": [
        "https://www.kia.com/in/our-vehicles/seltos/gallery.html",
        "https://www.kia.com/in/media-center.html",
        "https://www.kianewsroom.com/news-list/kia-seltos/c/0101004000/"
    ],
    "Hyundai_Creta": [
        "https://www.hyundai.com/in/en/find-a-car/creta/gallery",
        "https://www.hyundai.com/in/en/hyundai-story/media-center",
        "https://www.hyundainews.com"
    ],
    "Hyundai_Venue": [
        "https://www.hyundai.com/in/en/find-a-car/venue/gallery",
        "https://www.hyundai.com/in/en/hyundai-story/media-center"
    ],
    "Skoda_Kushaq": [
        "https://www.skoda-auto.in/models/kushaq/kushaq-gallery",
        "https://www.skoda-storyboard.com/en/models/kushaq/"
    ],
    "Volkswagen_Taigun": [
        "https://www.volkswagen.co.in/en/models/taigun/gallery.html",
        "https://www.volkswagen-newsroom.com/en/taigun-5282"
    ],
    "Honda_Elevate": [
        "https://www.hondacarindia.com/honda-elevate",
        "https://www.hondacarindia.com/media/press-releases"
    ],
    "MG_Astor": [
        "https://www.mgmotor.co.in/vehicles/mgastor/gallery",
        "https://www.mgmotor.co.in/media-center"
    ],
    "MG_Hector": [
        "https://www.mgmotor.co.in/vehicles/mghector/gallery",
        "https://www.mgmotor.co.in/media-center"
    ],
    "Citroen_Basalt": [
        "https://www.citroen.in/basalt",
        "https://www.media.stellantis.com/in-en/citroen"
    ],
    "Citroen_C3_Aircross": [
        "https://www.citroen.in/new-c3-aircross-suv",
        "https://www.media.stellantis.com/in-en/citroen"
    ]
}

# Helper regex to spot image URLs within scripts or JSON payloads
IMAGE_URL_REGEX = re_pattern = re.compile(
    r'(https?:\\?/\\?/[^"\']+\.(?:jpe?g|png|webp))', re.IGNORECASE
)

# Statistics tracker
stats = {
    "downloaded": 0,
    "skipped_duplicates": 0,
    "failed": 0,
}

# --- Module Functions ---

def setup_directories():
    """Initializes output directories for all target SUVs."""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    for car in OFFICIAL_SOURCES.keys():
        car_path = os.path.join(OUTPUT_DIR, car)
        if not os.path.exists(car_path):
            os.makedirs(car_path)

def clean_json_url(url: str) -> str:
    """Removes escape slashes typical of URLs harvested from JSON blobs."""
    return url.replace('\\/', '/')

def is_valid_image(content: bytes) -> tuple[bool, str, tuple[int, int]]:
    """Checks if image headers are valid and verifies it is >= 800x600."""
    try:
        img = Image.open(BytesIO(content))
        width, height = img.size
        
        # Enforce minimum resolution
        if width < MIN_WIDTH or height < MIN_HEIGHT:
            return False, "", (0, 0)
            
        img_format = img.format.lower() if img.format else ""
        if img_format not in ['jpeg', 'png', 'webp']:
            return False, "", (0, 0)
            
        ext = 'jpg' if img_format == 'jpeg' else img_format
        return True, ext, (width, height)
    except Exception:
        return False, "", (0, 0)

def classify_image_category(url: str) -> str:
    """Determines image category based on keywords inside the URL or filename."""
    url_lower = url.lower()
    
    if "interior" in url_lower or "cabin" in url_lower:
        if "dashboard" in url_lower or "dash" in url_lower or "steering" in url_lower:
            return "Dashboard"
        if "seat" in url_lower:
            return "Rear seat"
        return "Interior"
        
    if "boot" in url_lower or "trunk" in url_lower or "luggage" in url_lower:
        return "Boot"
        
    if "wheel" in url_lower or "alloy" in url_lower or "tyre" in url_lower:
        return "Wheel close-up"
        
    if "color" in url_lower or "colour" in url_lower or "paint" in url_lower:
        return "Color options"
        
    if "front" in url_lower:
        if "three-quarter" in url_lower or "3q" in url_lower or "3-4" in url_lower:
            return "Front three-quarter"
        return "Front"
        
    if "rear" in url_lower or "back" in url_lower:
        if "three-quarter" in url_lower or "3q" in url_lower or "3-4" in url_lower:
            return "Rear three-quarter"
        return "Rear"
        
    if "side" in url_lower or "profile" in url_lower:
        return "Side profile"
        
    return "General"

def extract_image_urls_from_page(url: str) -> list[str]:
    """Downloads a webpage and extracts potential image links from tags and script config payloads."""
    found_urls = []
    try:
        response = requests.get(url, headers=HEADERS, timeout=TIMEOUT_SECONDS)
        if response.status_code != 200:
            return []
            
        soup = BeautifulSoup(response.text, 'lxml')
        
        # 1. Standard HTML image tag scanning
        for img in soup.find_all('img'):
            # Check src, data-src, data-lazy, and other common lazy-loading fields
            for attr in ['src', 'data-src', 'data-original', 'data-lazy', 'srcset']:
                src = img.get(attr)
                if src:
                    # Clean clean paths (taking first item from srcset)
                    src_clean = src.split(',')[0].split(' ')[0].strip()
                    absolute_url = urljoin(url, src_clean)
                    found_urls.append(absolute_url)
                    
        # 2. Extract potential asset paths inside JSON scripts/configs
        for script in soup.find_all('script'):
            if script.string:
                for match in IMAGE_URL_REGEX.findall(script.string):
                    cleaned_match = clean_json_url(match)
                    absolute_url = urljoin(url, cleaned_match)
                    found_urls.append(absolute_url)
                    
    except Exception as e:
        # Fail silently to allow continuation of other sources
        pass
        
    # Return unique URLs containing valid image file extensions
    valid_exts = ('.jpg', '.jpeg', '.png', '.webp')
    return list(set(
        u for u in found_urls 
        if any(u.lower().split('?')[0].endswith(ext) for ext in valid_exts)
    ))

def download_single_image(url: str, car_name: str, existing_hashes: set[str]) -> bool:
    """Downloads an image, validates sizes, saves to disk, and updates metadata."""
    car_path = os.path.join(OUTPUT_DIR, car_name)
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT_SECONDS)
            if response.status_code != 200:
                continue
                
            img_bytes = response.content
            
            # 1. Deduplicate via SHA-256
            img_hash = hashlib.sha256(img_bytes).hexdigest()
            if img_hash in existing_hashes:
                stats["skipped_duplicates"] += 1
                return False
                
            # 2. Enforce minimum dimensions & retrieve type extension
            is_valid, ext, dims = is_valid_image(img_bytes)
            if not is_valid:
                return False
                
            # 3. Categorize image
            category = classify_image_category(url)
            
            # 4. Generate filename
            parsed_url = urlparse(url)
            orig_filename = os.path.basename(parsed_url.path)
            if not orig_filename or '.' not in orig_filename:
                orig_filename = f"{category.lower().replace(' ', '_')}_{img_hash[:8]}.{ext}"
            
            filepath = os.path.join(car_path, orig_filename)
            
            # Save image
            with open(filepath, 'wb') as f:
                f.write(img_bytes)
                
            # 5. Save/Update Metadata JSON
            meta_path = os.path.join(car_path, "metadata.json")
            metadata = []
            if os.path.exists(meta_path):
                try:
                    with open(meta_path, 'r') as f:
                        metadata = json.load(f)
                except Exception:
                    pass
                    
            metadata.append({
                "source_page": parsed_url.netloc,
                "image_url": url,
                "download_date": time.strftime("%Y-%m-%d %H:%M:%S"),
                "filename": orig_filename,
                "category": category,
                "image_size": f"{dims[0]}x{dims[1]}"
            })
            
            with open(meta_path, 'w') as f:
                json.dump(metadata, f, indent=4)
                
            existing_hashes.add(img_hash)
            stats["downloaded"] += 1
            return True
            
        except Exception:
            time.sleep(1) # Backoff before retry
            
    stats["failed"] += 1
    return False

def pack_zip_archive():
    """Zips the downloaded SUV image directory structures into a single file."""
    if not os.path.exists(OUTPUT_DIR) or not os.listdir(OUTPUT_DIR):
        print("No images downloaded. Skipping ZIP creation.")
        return
        
    with zipfile.ZipFile(ZIP_FILENAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(OUTPUT_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(OUTPUT_DIR))
                zipf.write(file_path, arcname)

# --- Main Flow ---

def main():
    print("====================================================")
    print(" SUV COMPARE INDIA 2026 - Official Image Downloader")
    print("====================================================")
    
    setup_directories()
    global_hashes = set()
    
    for car_name, urls in OFFICIAL_SOURCES.items():
        print(f"\nCrawling manufacturer domains for: {car_name.replace('_', ' ')}...")
        
        # 1. Harvest target image URLs across all media locations
        candidate_image_urls = []
        for index, url in enumerate(urls):
            extracted = extract_image_urls_from_page(url)
            candidate_image_urls.extend(extracted)
            
        candidate_image_urls = list(set(candidate_image_urls))
        
        if not candidate_image_urls:
            print(f"  [Notice] No direct assets found on official pages for {car_name}. Skipping/Moving on...")
            continue
            
        print(f"  Found {len(candidate_image_urls)} potential assets. Starting downloads...")
        
        # 2. Concurrently download images
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = [
                executor.submit(download_single_image, img_url, car_name, global_hashes)
                for img_url in candidate_image_urls
            ]
            # Standard progress bar visualization
            for _ in tqdm(as_completed(futures), total=len(futures), desc="  Downloading"):
                pass
                
    # 3. Compress final directories
    pack_zip_archive()
    
    # 4. Print Summary
    print("\n" + "="*52)
    print(" DOWNLOAD RUN COMPLETED")
    print("="*52)
    print(f" Total images downloaded: {stats['downloaded']}")
    print(f" Skipped duplicates:     {stats['skipped_duplicates']}")
    print(f" Failed downloads:        {stats['failed']}")
    if stats['downloaded'] > 0:
        print(f" ZIP archive location:    {os.path.abspath(ZIP_FILENAME)}")
    print("="*52)

if __name__ == "__main__":
    main()
