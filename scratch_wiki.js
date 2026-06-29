const fs = require('fs/promises');

async function testWiki() {
  const models = [
    'Kia Seltos', 'Hyundai Creta', 'Hyundai Venue', 'Volkswagen Taigun',
    'Skoda Kushaq', 'Honda Elevate', 'MG Astor', 'MG Hector',
    'Citroën Basalt', 'Citroën C3 Aircross'
  ];

  for (const model of models) {
    const title = encodeURIComponent(model);
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${title}`;
    
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'SUVCompareIndia/1.0 (test@example.com)'
        }
      });
      const data = await res.json();
      const pages = data.query.pages;
      const page = Object.values(pages)[0];
      if (page && page.original) {
        console.log(`${model}: ${page.original.source}`);
      } else {
        console.log(`${model}: No image found in Wikipedia`);
      }
    } catch (e) {
      console.error(`Error fetching ${model}:`, e.message);
    }
  }
}

testWiki();
