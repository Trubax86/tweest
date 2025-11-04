// Netlify Function: GET /api/streaming-link
const axios = require('axios');
const cheerio = require('cheerio');

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
    const pageUrl = event.queryStringParameters?.url;
    
    if (!pageUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'URL parameter is required'
        })
      };
    }
    
    console.log(`[NETLIFY] Extracting streaming link from: ${pageUrl}`);
    
    // Carica la pagina CB01
    const { data } = await axios.get(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(data);
    
    // Pattern per trovare link streaming
    const patterns = [
      /https?:\/\/uprot\.net\/msf\/[a-zA-Z0-9]+/i,
      /https?:\/\/stayonline\.pro\/l\/[a-zA-Z0-9]+/i,
      /https?:\/\/swzz\.xyz\/[a-zA-Z0-9]+/i,
      /https?:\/\/maxstream\.video\/[a-zA-Z0-9]+/i,
      /https?:\/\/mixdrop\.[a-z]+\/[ef]\/[a-zA-Z0-9]+/i
    ];

    let streamingUrl = null;

    // Cerca nei link della pagina
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      for (const pattern of patterns) {
        const match = href.match(pattern);
        if (match) {
          streamingUrl = match[0];
          return false; // break
        }
      }
    });

    // Cerca nel testo della pagina
    if (!streamingUrl) {
      for (const pattern of patterns) {
        const match = data.match(pattern);
        if (match) {
          streamingUrl = match[0];
          break;
        }
      }
    }

    if (!streamingUrl) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No streaming link found'
        })
      };
    }

    // Converti in URL embed se necessario
    if (streamingUrl.includes('uprot.net')) {
      const id = streamingUrl.split('/').pop();
      streamingUrl = `https://maxstream.video/embed-${id}.html`;
    } else if (streamingUrl.includes('stayonline.pro')) {
      const id = streamingUrl.split('/').pop();
      streamingUrl = `https://mixdrop.co/e/${id}`;
    }

    console.log(`[NETLIFY] ✅ Found streaming link: ${streamingUrl}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url: streamingUrl
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
