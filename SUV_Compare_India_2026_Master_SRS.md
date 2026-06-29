# SUV Compare India 2026

## Master Software Requirements Specification (Condensed)

> This document is intended to be the master specification for
> Antigravity. It defines architecture, UI philosophy, data model,
> scoring, comparison logic, image policy, performance targets and
> acceptance criteria.

# 1. Vision

Build the best data-first automotive comparison platform for Indian
petrol SUVs under ₹20 lakh.

The website should feel like GSMArena for cars: - searchable -
filterable - transparent - image-first - database-driven - extremely
clean

The primary objective is helping users make purchase decisions through
structured data rather than marketing.

# 2. Core Principles

-   Accuracy over speed
-   Images before text
-   Cars before UI decoration
-   Transparent scoring
-   Fully normalized database
-   Every specification has a source
-   Every subjective score has an explanation
-   Every page must be useful without scrolling

# 3. Supported Vehicles

Include: - Kia Seltos - Hyundai Creta - Hyundai Venue - Skoda Kushaq -
Volkswagen Taigun - Honda Elevate - MG Astor - MG Hector (petrol) -
Citroën Basalt - Citroën C3 Aircross

Exclude: - Base variants - Diesel variants - Tata, Toyota, Maruti,
Renault, Nissan, Mahindra

# 4. Image-First UI (Highest Priority)

Vehicle photography is the dominant visual element.

Rules: - Every card starts with a large vehicle image. - Images occupy
40--60% of major cards. - Every table that names a car should include an
image if space permits. - Every ranking row includes an image. - Every
comparison header includes an image. - Search, autocomplete,
recommendations, buyer guides, related vehicles and filters all include
images. - Images are clickable. - Never leave whitespace where a
meaningful vehicle image could be displayed. - Sticky headers on long
pages retain a thumbnail and vehicle name.

# 5. Database

Normalized entities: Manufacturers Models Variants Engines Transmissions
Dimensions FeatureCategories Features VariantFeatures Safety ADAS
Ownership Prices Media Sources ReviewConsensus ScoreCategories
VariantScores BuyerGuides Comparisons

Never store searchable features in JSON blobs.

# 6. Variant Content

Each variant contains: - Specifications - Exterior - Interior -
Comfort - Technology - Safety - ADAS - Ownership - Common issues - Pros
(10+) - Cons (10+) - Score explanations - Competitors - Upgrade path -
Image gallery

# 7. Scoring

Overall = 1000.

Luxury 120 Size 100 Interior 70 Comfort 80 Rear Comfort 70 Front Comfort
40 Features 90 Technology 60 Safety 90 ADAS 40 Engine 80 Transmission 50
Performance 40 Ride 50 Handling 30 Steering 20 NVH 40 Practicality 30
Boot 20 Fuel Economy 20 Reliability 50 Ownership 20 Resale 20 Value 50

Each category stores: - Score - Maximum - Explanation - Confidence

Additional scores: Luxury Mercedes Index Family Driver City Highway
Comfort Safety Technology Reliability

# 8. Filters

Brand Price Transmission Turbo Automatic Manual CVT DCT DSG IVT Luxury
Score Mercedes Index Overall Score Panoramic Roof Ventilated Seats 360
Camera ADAS Boot Ground Clearance Wheelbase Premium Audio

# 9. Comparison

Support 2--4 variants. Highlight winner in every row. Use sticky first
column and sticky image headers.

# 10. Buyer Guides

Generate: - Best under ₹15L - Best under ₹17L - Best under ₹20L - Best
family - Best luxury - Most Mercedes-like - Best city - Best highway -
Best value - Best driver's SUV

# 11. Performance

Use lazy loading, pagination, indexed search, caching, responsive images
and memoization.

# 12. Acceptance Criteria

✓ Every vehicle is visually identifiable immediately. ✓ Every page has
prominent images. ✓ Every score is transparent. ✓ Every specification
has a source. ✓ Every ranking is reproducible. ✓ Every comparison is
image-first. ✓ UI remains clean, dense and fast.
