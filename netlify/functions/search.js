// Netlify Function: GET /api/search
const axios = require('axios');
const cheerio = require('cheerio');

const CB01_BASE = process.env.CB01_BASE || 'https://cb01.makeup';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const query = event.queryStringParameters?.q;
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Query parameter "q" is required'
        })
      };
    }
    
    console.log(`[NETLIFY] Searching for: ${query}`);
    
    const { data } = await axios.get(`${CB01_BASE}/?s=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(data);
    const results = [];

    $('.card, article, .post, .item').each((i, el) => {
      const $el = $(el);
      const $link = $el.find('a').first();
      const $img = $el.find('img').first();

      const title = $link.attr('title') || $img.attr('alt') || '';
      const url = $link.attr('href') || '';
      const thumbnail = $img.attr('src') || $img.attr('data-src') || '';

      if (title && url) {
        const isSeries = url.includes('/serietv/') || url.includes('/serie-tv/');
        
        results.push({
          title: title.trim(),
          url,
          thumbnail,
          source: isSeries ? 'CB01 Serie' : 'CB01'
        });
      }
    });

    console.log(`[NETLIFY] ✅ Found ${results.length} results`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: results.length,
        data: results
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
