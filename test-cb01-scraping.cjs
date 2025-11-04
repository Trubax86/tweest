// TEST SCRAPING CB01 - Analizza struttura HTML
const axios = require('axios');
const cheerio = require('cheerio');

const CB01_BASE = 'https://cb01net.website';

async function testScraping() {
  try {
    console.log('🔍 Scaricamento homepage CB01...\n');
    
    const { data } = await axios.get(CB01_BASE, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    
    console.log('📊 ANALISI STRUTTURA HTML:\n');
    
    // Trova tutti i link h3
    const links = $('h3 a[href]');
    console.log(`✅ Trovati ${links.length} link h3\n`);
    
    // Analizza i primi 3 in dettaglio
    links.slice(0, 3).each((i, el) => {
      const $link = $(el);
      const title = $link.text().trim();
      const url = $link.attr('href');
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📌 FILM ${i + 1}: ${title}`);
      console.log(`🔗 URL: ${url}`);
      
      // Cerca article parent
      const $article = $link.closest('article');
      console.log(`📦 Article trovato: ${$article.length > 0 ? 'SI' : 'NO'}`);
      
      if ($article.length) {
        console.log(`📦 Article class: ${$article.attr('class')}`);
        console.log(`📦 Article id: ${$article.attr('id')}`);
        
        // Cerca tutte le immagini nell'article
        const $images = $article.find('img');
        console.log(`🖼️  Immagini trovate nell'article: ${$images.length}`);
        
        $images.each((imgIndex, imgEl) => {
          const $img = $(imgEl);
          console.log(`\n   🖼️  IMMAGINE ${imgIndex + 1}:`);
          console.log(`   - src: ${$img.attr('src') || 'VUOTO'}`);
          console.log(`   - data-src: ${$img.attr('data-src') || 'VUOTO'}`);
          console.log(`   - data-lazy-src: ${$img.attr('data-lazy-src') || 'VUOTO'}`);
          console.log(`   - data-original: ${$img.attr('data-original') || 'VUOTO'}`);
          console.log(`   - data-wpfc-original-src: ${$img.attr('data-wpfc-original-src') || 'VUOTO'}`);
          console.log(`   - data-ezsrc: ${$img.attr('data-ezsrc') || 'VUOTO'}`);
          console.log(`   - class: ${$img.attr('class') || 'VUOTO'}`);
          console.log(`   - alt: ${$img.attr('alt') || 'VUOTO'}`);
        });
      } else {
        // Prova parent div
        const $parent = $link.parent();
        console.log(`📦 Parent: ${$parent.prop('tagName')}`);
        console.log(`📦 Parent class: ${$parent.attr('class')}`);
        
        const $grandparent = $parent.parent();
        console.log(`📦 Grandparent: ${$grandparent.prop('tagName')}`);
        console.log(`📦 Grandparent class: ${$grandparent.attr('class')}`);
        
        // Cerca card completa (potrebbe essere più su)
        const $card = $link.closest('.card, article, .post, .item');
        console.log(`📦 Card trovata: ${$card.length > 0 ? 'SI' : 'NO'}`);
        if ($card.length) {
          console.log(`📦 Card class: ${$card.attr('class')}`);
        }
        
        // Cerca img nel grandparent
        const $img = $grandparent.find('img').first();
        if ($img.length) {
          console.log(`\n   🖼️  IMMAGINE TROVATA IN GRANDPARENT:`);
          console.log(`   - src: ${$img.attr('src') || 'VUOTO'}`);
          console.log(`   - data-src: ${$img.attr('data-src') || 'VUOTO'}`);
          console.log(`   - data-lazy-src: ${$img.attr('data-lazy-src') || 'VUOTO'}`);
        } else {
          console.log(`\n   ⚠️  NESSUNA IMMAGINE IN GRANDPARENT`);
          
          // Cerca in card se esiste
          if ($card.length) {
            const $cardImg = $card.find('img').first();
            if ($cardImg.length) {
              console.log(`\n   🖼️  IMMAGINE TROVATA IN CARD:`);
              console.log(`   - src: ${$cardImg.attr('src') || 'VUOTO'}`);
              console.log(`   - data-src: ${$cardImg.attr('data-src') || 'VUOTO'}`);
              console.log(`   - data-lazy-src: ${$cardImg.attr('data-lazy-src') || 'VUOTO'}`);
            }
          }
          
          // Cerca sibling (immagine potrebbe essere prima del titolo)
          const $prevImg = $grandparent.find('img').first();
          if ($prevImg.length) {
            console.log(`\n   🖼️  IMMAGINE TROVATA IN PREV SIBLING:`);
            console.log(`   - src: ${$prevImg.attr('src') || 'VUOTO'}`);
            console.log(`   - data-src: ${$prevImg.attr('data-src') || 'VUOTO'}`);
          }
        }
      }
    });
    
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ANALISI COMPLETATA!');
    
  } catch (error) {
    console.error('❌ ERRORE:', error.message);
  }
}

testScraping();
