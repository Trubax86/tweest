/**
 * 🎬 Hybrid Content Manager - CB01 + TMDb
 * Combina scraping CB01 con immagini HD da TMDb
 */

import TMDbService from './TMDbService';

export interface HybridContent {
  title: string;
  description: string;
  cb01Url: string;
  posterUrl: string;
  backdropUrl: string;
  hasStreamingLink: boolean;
  year: string;
  rating: number;
  contentType: 'movie' | 'tv';
  source: string;
}

class HybridContentManager {
  /**
   * 🔥 Ottieni contenuti ibridi (CB01 + TMDb)
   */
  async getHybridContent(cb01Data: any[]): Promise<HybridContent[]> {
    const hybridContent: HybridContent[] = [];

    for (const cb01 of cb01Data) {
      try {
        // Determina tipo contenuto
        const isSeries = cb01.source.includes('Serie') || cb01.url.includes('/serietv/');
        const contentType: 'movie' | 'tv' = isSeries ? 'tv' : 'movie';

        // PULISCI TITOLO SUPER AGGRESSIVO (come SKYEmulator)
        let cleanTitle = cb01.title;
        
        // Decodifica HTML entities
        cleanTitle = cleanTitle.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
        
        // Rimuovi episodi: "3×03", "1×05", "S01E05"
        cleanTitle = cleanTitle.replace(/\s*[-–—]\s*\d+[×xX]\d+.*$/i, '');
        cleanTitle = cleanTitle.replace(/\s*[-–—]\s*S\d+E\d+.*$/i, '');
        
        // Rimuovi stagioni: "Stagione 4", "Season 2"
        cleanTitle = cleanTitle.replace(/\s*[-–—]\s*(Stagione|Season)\s*\d+.*$/i, '');
        cleanTitle = cleanTitle.replace(/\s*[-–—]\s*COMPLETA.*$/i, '');
        
        // Rimuovi parentesi e quadre
        cleanTitle = cleanTitle.replace(/\s*\(.*?\)\s*/g, '');
        cleanTitle = cleanTitle.replace(/\s*\[.*?\]\s*/g, '');
        
        // Rimuovi trattini finali e trim
        cleanTitle = cleanTitle.replace(/[-–—\s]+$/, '').trim();

        console.log(`[Hybrid] Titolo pulito: "${cb01.title}" → "${cleanTitle}"`);

        // Cerca su TMDb per immagini HD
        const tmdbResults = await TMDbService.searchContent(cleanTitle, contentType);
        
        // PREFERISCI RISULTATI CON POSTER (come SKYEmulator)
        const tmdbMatch = tmdbResults.find(r => r.posterPath) || tmdbResults[0];

        // FALLBACK INTELLIGENTE: TMDb > CB01 thumbnail > Placeholder
        const posterUrl = tmdbMatch?.posterPath 
          ? TMDbService.getImageUrl(tmdbMatch.posterPath, 'w500')
          : (cb01.thumbnail || 'https://placehold.co/500x750/1a1a1a/e50914?text=' + encodeURIComponent(cb01.title.substring(0, 30)));

        const backdropUrl = tmdbMatch?.backdropPath
          ? TMDbService.getImageUrl(tmdbMatch.backdropPath, 'w1280')
          : (cb01.thumbnail || 'https://placehold.co/1280x720/1a1a1a/e50914?text=' + encodeURIComponent(cb01.title.substring(0, 30)));

        const hybrid: HybridContent = {
          title: cb01.title,
          description: tmdbMatch?.overview || cb01.description || '',
          cb01Url: cb01.url,
          posterUrl,
          backdropUrl,
          hasStreamingLink: true,
          year: tmdbMatch?.releaseDate?.substring(0, 4) || cb01.year || '',
          rating: tmdbMatch?.voteAverage || 0,
          contentType,
          source: cb01.source
        };

        hybridContent.push(hybrid);
      } catch (error) {
        console.error('[Hybrid] Errore elaborazione:', cb01.title, error);
        
        // Fallback senza TMDb
        hybridContent.push({
          title: cb01.title,
          description: cb01.description || '',
          cb01Url: cb01.url,
          posterUrl: cb01.thumbnail || 'https://via.placeholder.com/500x750/1a1a1a/e50914?text=' + encodeURIComponent(cb01.title),
          backdropUrl: 'https://via.placeholder.com/1280x720/1a1a1a/e50914?text=' + encodeURIComponent(cb01.title),
          hasStreamingLink: true,
          year: cb01.year || '',
          rating: 0,
          contentType: cb01.source.includes('Serie') ? 'tv' : 'movie',
          source: cb01.source
        });
      }
    }

    return hybridContent;
  }

  /**
   * 🎬 Ottieni contenuti popolari (TMDb diretto)
   */
  async getPopularContent(): Promise<HybridContent[]> {
    try {
      const [movies, series] = await Promise.all([
        TMDbService.getPopularMovies(1),
        TMDbService.getPopularSeries(1)
      ]);

      const allContent = [...movies, ...series];

      return allContent.map(tmdb => ({
        title: tmdb.title,
        description: tmdb.overview,
        cb01Url: '', // Non ha link CB01
        posterUrl: TMDbService.getImageUrl(tmdb.posterPath, 'w500'),
        backdropUrl: TMDbService.getImageUrl(tmdb.backdropPath, 'w1280'),
        hasStreamingLink: false,
        year: tmdb.releaseDate.substring(0, 4),
        rating: tmdb.voteAverage,
        contentType: tmdb.contentType,
        source: 'TMDb'
      }));
    } catch (error) {
      console.error('[Hybrid] Errore contenuti popolari:', error);
      return [];
    }
  }
}

export default new HybridContentManager();
