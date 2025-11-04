// Netlify Function: GET /api/movies
const axios = require('axios');
const cheerio = require('cheerio');

const CB01_BASE = process.env.CB01_BASE || 'https://cb01.makeup';

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const count = parseInt(event.queryStringParameters?.count) || 30;
    
    console.log(`[NETLIFY] Fetching ${count} movies from CB01...`);
    
    const { data } = await axios.get(`${CB01_BASE}/film/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(data);
    const movies = [];

    $('.card, article, .post, .item').slice(0, count).each((i, el) => {
      const $el = $(el);
      const $link = $el.find('a').first();
      const $img = $el.find('img').first();

      const title = $link.attr('title') || $img.attr('alt') || '';
      const url = $link.attr('href') || '';
      const thumbnail = $img.attr('src') || $img.attr('data-src') || '';

      if (title && url) {
        movies.push({
          title: title.trim(),
          url,
          thumbnail,
          source: 'CB01'
        });
      }
    });

    console.log(`[NETLIFY] ✅ Found ${movies.length} movies`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: movies.length,
        data: movies
      })
    };

  } catch (error) {
    console.error('[NETLIFY] ❌ Error:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
