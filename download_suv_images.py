import os
import re
import json
import hashlib
import time
import zipfile
import shutil
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup
from PIL import Image
from tqdm import tqdm
from io import BytesIO

# Try to load Playwright sync api for JS-rendered gallery fallback
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

# --- Configuration & Constants ---
OUTPUT_DIR = "SUV_Compare_India_2026"
PUBLIC_DIR = os.path.join("public", "SUV_Compare_India_2026")
ZIP_FILENAME = "SUV_Compare_India_2026.zip"
MIN_WIDTH = 800
MIN_HEIGHT = 600
PREFERRED_WIDTH = 1200
MAX_RETRIES = 3
TIMEOUT_SECONDS = 15

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
}

# Target SUVs and starting gallery/press pages
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

# Mappings of recognized categories to target filenames
FILENAME_MAPS = {
    "Hero": "hero",
    "Front": "front",
    "Rear": "rear",
    "Dashboard": "dashboard",
    "Interior": "interior",
    "Boot": "boot",
    "Wheel": "wheel",
    "Side profile": "side",
    "Front three-quarter": "front_3q",
    "Rear three-quarter": "rear_3q",
    "Front seats": "front_seats",
    "Rear seats": "rear_seats"
}

# Regex to detect absolute image URLs in script tags or payloads
IMAGE_URL_REGEX = re.compile(
    r'(https?:\\?/\\?/[^"\']+\.(?:jpe?g|png|webp))', re.IGNORECASE
)

stats = {
    "downloaded": 0,
    "duplicates_skipped": 0,
    "failed": 0
}

# --- Utility Functions ---

def setup_directories():
    """Initializes local output folders and subfolders for color options."""
    for folder in [OUTPUT_DIR, PUBLIC_DIR]:
        if not os.path.exists(folder):
            os.makedirs(folder)
            
    for car in OFFICIAL_SOURCES.keys():
        for base_dir in [OUTPUT_DIR, PUBLIC_DIR]:
            car_dir = os.path.join(base_dir, car)
            colors_dir = os.path.join(car_dir, "colors")
            for d in [car_dir, colors_dir]:
                if not os.path.exists(d):
                    os.makedirs(d)

def is_valid_image(content: bytes) -> tuple[bool, str, tuple[int, int], str]:
    """Validates size (>= 800x600), format, and corruption. Returns (isValid, ext, size, mime)."""
    try:
        img = Image.open(BytesIO(content))
        width, height = img.size
        
        # Enforce minimum size requirements
        if width < MIN_WIDTH or height < MIN_HEIGHT:
            return False, "", (0, 0), ""
            
        img_format = img.format.lower() if img.format else ""
        if img_format not in ['jpeg', 'png', 'webp']:
            return False, "", (0, 0), ""
            
        ext = 'jpg' if img_format == 'jpeg' else img_format
        mime = f"image/{img_format}"
        
        return True, ext, (width, height), mime
    except Exception:
        return False, "", (0, 0), ""

def classify_category(url: str) -> str:
    """Classifies the image category based on URL keywords."""
    url_lower = url.lower()
    
    if "interior" in url_lower or "cabin" in url_lower:
        if "dashboard" in url_lower or "dash" in url_lower or "steering" in url_lower:
            return "Dashboard"
        if "front-seat" in url_lower or "frontseat" in url_lower:
            return "Front seats"
        if "rear-seat" in url_lower or "rearseat" in url_lower:
            return "Rear seats"
        return "Interior"
        
    if "boot" in url_lower or "trunk" in url_lower or "luggage" in url_lower:
        return "Boot"
        
    if "wheel" in url_lower or "alloy" in url_lower or "rim" in url_lower or "tyre" in url_lower:
        return "Wheel"
        
    if "color" in url_lower or "colour" in url_lower or "shade" in url_lower:
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
        
    return "Hero" # Default/Fallback to Hero

# --- The 10 Extraction Strategies ---

def run_playwright_extraction(url: str) -> list[str]:
    """Strategy 9: Dynamically render page in headless browser to extract final images."""
    if not PLAYWRIGHT_AVAILABLE:
        return []
    
    extracted_urls = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new-page()
            page.goto(url, wait_until="networkidle", timeout=30000)
            
            # Extract standard image elements
            images = page.eval-on-selector-all("img", "elements => elements.map(e => e.src || e.dataset.src)")
            for img in images:
                if img:
                    extracted_urls.append(img)
                    
            # Extract background CSS images
            bg_images = page.eval-on-selector-all("*", "elements => elements.map(e => window.getComputedStyle(e).backgroundImage)")
            for bg in bg_images:
                if bg and "url(" in bg:
                    cleaned_bg = bg.replace('url("', '').replace('")', '').replace("url('", "").replace("')", "").replace("url(", "").replace(")", "").strip()
                    extracted_urls.append(cleaned_bg)
                    
            browser.close()
    except Exception:
        pass
    return extracted_urls

def extract_image_urls(url: str) -> list[str]:
    """Applies all 10 extraction strategies sequentially to gather direct image URLs."""
    urls = []
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=TIMEOUT_SECONDS)
        if response.status_code != 200:
            return []
            
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Strategy 1 & 8: HTML Image Tags + Lazy-Loaded Attributes
        for img in soup.find_all('img'):
            for attr in ['src', 'data-src', 'data-original', 'data-lazy', 'data-lazy-src']:
                val = img.get(attr)
                if val:
                    urls.append(urljoin(url, val.split(',')[0].split(' ')[0].strip()))
                    
        # Strategy 2: OpenGraph Images
        for meta in soup.find_all('meta', property='og:image'):
            content = meta.get('content')
            if content:
                urls.append(urljoin(url, content))
                
        # Strategy 3: Twitter Card Images
        for meta in soup.find_all('meta', attrs={'name': 'twitter:image'}):
            content = meta.get('content')
            if content:
                urls.append(urljoin(url, content))
                
        # Strategy 4: JSON-LD Structured Data
        for script in soup.find_all('script', type='application/ld+json'):
            if script.string:
                try:
                    js_data = json.loads(script.string)
                    # Traverse dict/lists looking for "image" or "logo" keys
                    def traverse(obj):
                        if isinstance(obj, dict):
                            for k, v in obj.items():
                                if k in ['image', 'logo', 'url'] and isinstance(v, str) and any(v.endswith(e) for e in ['.jpg', '.jpeg', '.png', '.webp']):
                                    urls.append(urljoin(url, v))
                                else:
                                    traverse(v)
                        elif isinstance(obj, list):
                            for item in obj:
                                traverse(item)
                    traverse(js_data)
                except Exception:
                    pass
                    
        # Strategy 5 & 10: Manufacturer JSON Configuration / CDN endpoints
        for script in soup.find_all('script'):
            if script.string:
                for match in IMAGE_URL_REGEX.findall(script.string):
                    cleaned = match.replace('\\/', '/')
                    urls.append(urljoin(url, cleaned))
                    
        # Strategy 6: Background-Image CSS
        for tag in soup.find_all(style=True):
            style = tag.get('style')
            if 'background-image' in style:
                match = re.search(r'url\([\'"]?([^\'")]+)[\'"]?\)', style)
                if match:
                    urls.append(urljoin(url, match.group(1)))
                    
        # Strategy 7: srcset Entries
        for tag in soup.find_all(['img', 'source']):
            srcset = tag.get('srcset')
            if srcset:
                for entry in srcset.split(','):
                    cleaned_entry = entry.strip().split(' ')[0]
                    if cleaned_entry:
                        urls.append(urljoin(url, cleaned_entry))
                        
    except Exception:
        pass
        
    # Strategy 9: Playwright JS Fallback (if static extraction yields no files)
    if not urls and PLAYWRIGHT_AVAILABLE:
        urls.extend(run_playwright_extraction(url))
        
    # Filter for valid file formats & resolve absolute paths
    valid_exts = ('.jpg', '.jpeg', '.png', '.webp')
    unique_urls = []
    for u in set(urls):
        parsed = urlparse(u)
        if any(parsed.path.lower().endswith(ext) for ext in valid_exts):
            unique_urls.append(u)
            
    return unique_urls

# --- Downloader & Zipping ---

def download_image(url: str, car_name: str, existing_hashes: set[str]) -> bool:
    """Downloads an image, checks limits, classifies it, and saves metadata."""
    category = classify_category(url)
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT_SECONDS)
            if response.status_code != 200:
                continue
                
            img_bytes = response.content
            
            # 1. Duplicate detection
            img_hash = hashlib.sha256(img_bytes).hexdigest()
            if img_hash in existing_hashes:
                stats["duplicates_skipped"] += 1
                return False
                
            # 2. Validation (Minimum 800x600 size check)
            is_valid, ext, dims, mime = is_valid_image(img_bytes)
            if not is_valid:
                return False
                
            # 3. Filename configuration
            base_filename = FILENAME_MAPS.get(category, f"img_{img_hash[:8]}")
            filename = f"{base_filename}.{ext}"
            
            # 4. Save to BOTH Output and Public serving directory
            for base_dir in [OUTPUT_DIR, PUBLIC_DIR]:
                car_dir = os.path.join(base_dir, car_name)
                
                # Colors subfolder handling
                if category == "Color options":
                    filepath = os.path.join(car_dir, "colors", filename)
                else:
                    filepath = os.path.join(car_dir, filename)
                    
                with open(filepath, 'wb') as f:
                    f.write(img_bytes)
                    
                # 5. Metadata JSON configuration
                meta_path = os.path.join(car_dir, "metadata.json")
                meta_content = []
                if os.path.exists(meta_path):
                    try:
                        with open(meta_path, 'r') as f:
                            meta_content = json.load(f)
                    except Exception:
                        pass
                        
                meta_content.append({
                    "source page": urlparse(url).netloc,
                    "original image URL": url,
                    "filename": filename,
                    "width": dims[0],
                    "height": dims[1],
                    "MIME type": mime,
                    "download date": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "SHA-256 hash": img_hash
                })
                
                with open(meta_path, 'w') as f:
                    json.dump(meta_content, f, indent=4)
                    
            existing_hashes.add(img_hash)
            stats["downloaded"] += 1
            return True
            
        except Exception:
            time.sleep(1)
            
    stats["failed"] += 1
    return False

def generate_zip_archive():
    """Zips up the final SUV output folders into the root directory archive."""
    if not os.path.exists(OUTPUT_DIR) or not os.listdir(OUTPUT_DIR):
        return
    with zipfile.ZipFile(ZIP_FILENAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(OUTPUT_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(OUTPUT_DIR))
                zipf.write(file_path, arcname)

# --- Executable Flow ---

def main():
    print("====================================================")
    print(" SUV COMPARE INDIA 2026 - Production Image Crawler")
    print("====================================================")
    
    if not PLAYWRIGHT_AVAILABLE:
        print("[Tip] Run: pip install playwright && playwright install")
        print("      to enable dynamic JS-rendered page galleries.\n")
        
    setup_directories()
    global_hashes = set()
    
    for car_name, start_urls in OFFICIAL_SOURCES.items():
        print(f"\nCrawling manufacturer resources for: {car_name.replace('_', ' ')}...")
        
        harvested_urls = []
        for url in start_urls:
            extracted = extract_image_urls(url)
            harvested_urls.extend(extracted)
            
        harvested_urls = list(set(harvested_urls))
        
        if not harvested_urls:
            print(f"  [Warning] All 10 retrieval strategies returned 0 urls for {car_name}.")
            continue
            
        print(f"  Found {len(harvested_urls)} candidate image links. Downloading...")
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = [
                executor.submit(download_image, img_url, car_name, global_hashes)
                for img_url in harvested_urls
            ]
            for _ in tqdm(as_completed(futures), total=len(futures), desc="  Progress"):
                pass
                
    generate_zip_archive()
    
    print("\n" + "="*52)
    print(" RUN SUMMARIZED")
    print("="*52)
    print(f" Total images downloaded:    {stats['downloaded']}")
    print(f" Duplicate images skipped:   {stats['duplicates_skipped']}")
    print(f" Failed downloads:           {stats['failed']}")
    if stats['downloaded'] > 0:
        print(f" ZIP archive generated at:   {os.path.abspath(ZIP_FILENAME)}")
    print("="*52)

if __name__ == "__main__":
    main()
