/**
 * 🎬 TMDb Service - The Movie Database API
 * Fornisce immagini HD e metadata per contenuti
 */

const TMDB_API_KEY = '7b4de6c59942c6a223b10c0141677c44'; // API Key TMDb funzionante
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TMDbContent {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string;
  contentType: 'movie' | 'tv';
}

export interface TMDbDetails extends TMDbContent {
  genres: string[];
  runtime?: number;
  numberOfSeasons?: number;
  cast: string[];
  trailerKey?: string;
}

class TMDbService {
  /**
   * 🔍 Cerca contenuto su TMDb
   */
  async searchContent(query: string, type: 'movie' | 'tv' | 'multi' = 'multi'): Promise<TMDbContent[]> {
    try {
      const cleanQuery = this.cleanTitle(query);
      const endpoint = type === 'multi' ? 'search/multi' : `search/${type}`;
      
      const response = await fetch(
        `${TMDB_BASE}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanQuery)}&language=it-IT`
      );
      
      const data = await response.json();
      
      return (data.results || [])
        .filter((item: any) => item.poster_path) // Solo con immagini
        .slice(0, 5)
        .map((item: any) => ({
          id: item.id,
          title: item.title || item.name,
          overview: item.overview,
          posterPath: item.poster_path,
          backdropPath: item.backdrop_path,
          voteAverage: item.vote_average,
          releaseDate: item.release_date || item.first_air_date || '',
          contentType: item.media_type === 'tv' || type === 'tv' ? 'tv' : 'movie'
        }));
    } catch (error) {
      console.error('[TMDb] Errore ricerca:', error);
      return [];
    }
  }

  /**
   * 📋 Ottieni dettagli completi
   */
  async getDetails(id: number, type: 'movie' | 'tv'): Promise<TMDbDetails | null> {
    try {
      const [details, credits, videos] = await Promise.all([
        fetch(`${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}&language=it-IT`).then(r => r.json()),
        fetch(`${TMDB_BASE}/${type}/${id}/credits?api_key=${TMDB_API_KEY}`).then(r => r.json()),
        fetch(`${TMDB_BASE}/${type}/${id}/videos?api_key=${TMDB_API_KEY}&language=it-IT`).then(r => r.json())
      ]);

      const trailer = videos.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');

      return {
        id: details.id,
        title: details.title || details.name,
        overview: details.overview,
        posterPath: details.poster_path,
        backdropPath: details.backdrop_path,
        voteAverage: details.vote_average,
        releaseDate: details.release_date || details.first_air_date || '',
        contentType: type,
        genres: (details.genres || []).map((g: any) => g.name),
        runtime: details.runtime,
        numberOfSeasons: details.number_of_seasons,
        cast: (credits.cast || []).slice(0, 5).map((c: any) => c.name),
        trailerKey: trailer?.key
      };
    } catch (error) {
      console.error('[TMDb] Errore dettagli:', error);
      return null;
    }
  }

  /**
   * 🎬 Film popolari italiani
   */
  async getPopularMovies(page: number = 1): Promise<TMDbContent[]> {
    try {
      const response = await fetch(
        `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&language=it-IT&region=IT&sort_by=popularity.desc&page=${page}`
      );
      
      const data = await response.json();
      
      return (data.results || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        overview: item.overview,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        voteAverage: item.vote_average,
        releaseDate: item.release_date || '',
        contentType: 'movie' as const
      }));
    } catch (error) {
      console.error('[TMDb] Errore film popolari:', error);
      return [];
    }
  }

  /**
   * 📺 Serie TV popolari italiane
   */
  async getPopularSeries(page: number = 1): Promise<TMDbContent[]> {
    try {
      const response = await fetch(
        `${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&language=it-IT&sort_by=popularity.desc&page=${page}`
      );
      
      const data = await response.json();
      
      return (data.results || []).map((item: any) => ({
        id: item.id,
        title: item.name,
        overview: item.overview,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        voteAverage: item.vote_average,
        releaseDate: item.first_air_date || '',
        contentType: 'tv' as const
      }));
    } catch (error) {
      console.error('[TMDb] Errore serie popolari:', error);
      return [];
    }
  }

  /**
   * 🖼️ Ottieni URL immagine
   */
  getImageUrl(path: string | null, size: 'w200' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string {
    if (!path) return 'https://via.placeholder.com/500x750/1a1a1a/e50914?text=No+Image';
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }

  /**
   * 🧹 Pulisci titolo per ricerca
   */
  private cleanTitle(title: string): string {
    let clean = title;
    
    // Rimuovi HTML entities
    clean = clean.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    
    // Rimuovi episodi: "3×03", "S01E05"
    clean = clean.replace(/\s*[-–—]\s*\d+[×xX]\d+.*$/i, '');
    clean = clean.replace(/\s*[-–—]\s*S\d+E\d+.*$/i, '');
    
    // Rimuovi stagioni
    clean = clean.replace(/\s*[-–—]\s*(Stagione|Season)\s*\d+.*$/i, '');
    
    // Rimuovi tag
    clean = clean.replace(/\s*[-–—]\s*(COMPLETA|ITA|SUB-ITA|HD|4K).*$/i, '');
    clean = clean.replace(/\[(HD|4K|ITA|SUB-ITA)\]/gi, '');
    
    return clean.trim();
  }
}

export default new TMDbService();
