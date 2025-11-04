import { useEffect, useState } from 'react';
import './ContentDialog.css';
import TMDbService, { TMDbDetails } from '../services/TMDbService';
import { HybridContent } from '../services/HybridContentManager';
import axios from 'axios';

interface Episode {
  seasonNumber: number;
  episodeNumber: number;
  links: Array<{
    provider: string;
    url: string;
    quality: string;
  }>;
}

interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

interface ContentDialogProps {
  content: HybridContent | null;
  onClose: () => void;
  onPlay: (url: string, title: string) => void;
}

export default function ContentDialog({ content, onClose, onPlay }: ContentDialogProps) {
  const [details, setDetails] = useState<TMDbDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    if (!content) return;

    loadDetails();
  }, [content]);

  const loadDetails = async () => {
    if (!content) return;

    setLoading(true);
    
    try {
      // Cerca su TMDb per dettagli completi
      const results = await TMDbService.searchContent(content.title, content.contentType);
      
      if (results[0]) {
        const fullDetails = await TMDbService.getDetails(results[0].id, content.contentType);
        setDetails(fullDetails);
      }

      // Se è una serie TV, carica episodi da CB01
      if (content.contentType === 'tv' && content.cb01Url) {
        loadEpisodes();
      }
    } catch (error) {
      console.error('[Dialog] Errore caricamento dettagli:', error);
    }
    
    setLoading(false);
  };

  const loadEpisodes = async () => {
    if (!content?.cb01Url) return;

    setLoadingEpisodes(true);
    
    try {
      const response = await axios.get(`/api/episodes?url=${encodeURIComponent(content.cb01Url)}`);
      
      if (response.data.success && response.data.data) {
        const seasonsData: Season[] = response.data.data;
        setSeasons(seasonsData);
        
        if (seasonsData.length > 0) {
          setSelectedSeason(seasonsData[0].seasonNumber);
        }
        
        console.log(`[Dialog] Caricate ${seasonsData.length} stagioni`);
      }
    } catch (error) {
      console.error('[Dialog] Errore caricamento episodi:', error);
    }
    
    setLoadingEpisodes(false);
  };

  if (!content) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="dialog-content">
        {/* CLOSE BUTTON */}
        <button className="dialog-close" onClick={onClose}>
          ✕
        </button>

        {/* BACKDROP */}
        <div className="dialog-backdrop">
          <img src={content.backdropUrl} alt={content.title} />
          <div className="dialog-backdrop-gradient"></div>
        </div>

        {/* INFO */}
        <div className="dialog-info">
          <h1 className="dialog-title">{content.title}</h1>
          
          <div className="dialog-meta">
            <span className="dialog-rating">
              ⭐ {content.rating > 0 ? content.rating.toFixed(1) : 'N/A'}
            </span>
            <span className="dialog-year">{content.year}</span>
            <span className="dialog-type">
              {content.contentType === 'tv' ? '📺 Serie TV' : '🎬 Film'}
            </span>
            <span className="dialog-source">{content.source}</span>
          </div>

          {/* ACTIONS */}
          <div className="dialog-actions">
            {content.contentType === 'tv' && seasons.length > 0 ? (
              <button 
                className="dialog-btn dialog-btn-play"
                onClick={() => {
                  // Play primo episodio della prima stagione
                  const firstSeason = seasons[0];
                  const firstEp = firstSeason.episodes[0];
                  const firstLink = firstEp.links[0];
                  if (firstLink) {
                    onPlay(firstLink.url, `${content.title} - S${firstEp.seasonNumber}E${firstEp.episodeNumber}`);
                  }
                }}
              >
                ▶ Riproduci Primo Episodio
              </button>
            ) : content.hasStreamingLink && content.cb01Url && (
              <button 
                className="dialog-btn dialog-btn-play"
                onClick={() => onPlay(content.cb01Url, content.title)}
              >
                ▶ Riproduci
              </button>
            )}
            
            {details?.trailerKey && (
              <button 
                className="dialog-btn dialog-btn-trailer"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${details.trailerKey}`, '_blank')}
              >
                🎬 Trailer
              </button>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="dialog-description">
            <h3>Trama</h3>
            <p>{content.description || 'Nessuna descrizione disponibile.'}</p>
          </div>

          {/* DETAILS */}
          {loading ? (
            <div className="dialog-loading">
              <div className="spinner-small"></div>
              <p>Caricamento dettagli...</p>
            </div>
          ) : details && (
            <div className="dialog-details">
              {details.genres.length > 0 && (
                <div className="dialog-detail-row">
                  <strong>Generi:</strong>
                  <span>{details.genres.join(', ')}</span>
                </div>
              )}

              {details.cast.length > 0 && (
                <div className="dialog-detail-row">
                  <strong>Cast:</strong>
                  <span>{details.cast.join(', ')}</span>
                </div>
              )}

              {details.runtime && (
                <div className="dialog-detail-row">
                  <strong>Durata:</strong>
                  <span>{details.runtime} min</span>
                </div>
              )}

              {details.numberOfSeasons && (
                <div className="dialog-detail-row">
                  <strong>Stagioni:</strong>
                  <span>{details.numberOfSeasons}</span>
                </div>
              )}
            </div>
          )}

          {/* EPISODI (SOLO PER SERIE TV) */}
          {content.contentType === 'tv' && (
            <div className="dialog-episodes">
              <div className="episodes-header">
                <h3>📺 Episodi</h3>
                {seasons.length > 1 && (
                  <select 
                    className="season-selector"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                  >
                    {seasons.map((season) => (
                      <option key={season.seasonNumber} value={season.seasonNumber}>
                        Stagione {season.seasonNumber}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {loadingEpisodes ? (
                <div className="dialog-loading">
                  <div className="spinner-small"></div>
                  <p>Caricamento episodi...</p>
                </div>
              ) : seasons.length > 0 ? (
                <div className="episodes-grid">
                  {seasons
                    .find(s => s.seasonNumber === selectedSeason)
                    ?.episodes.map((ep, index) => (
                      <div 
                        key={index} 
                        className="episode-card"
                        onClick={() => {
                          const link = ep.links[0];
                          if (link) {
                            onPlay(link.url, `${content.title} - S${ep.seasonNumber}E${ep.episodeNumber}`);
                          }
                        }}
                      >
                        <div className="episode-number">
                          {ep.episodeNumber === 0 ? '★' : `${ep.episodeNumber}`}
                        </div>
                        <div className="episode-info">
                          <div className="episode-title">
                            {ep.episodeNumber === 0 ? 'Serie Completa' : `Episodio ${ep.episodeNumber}`}
                          </div>
                          <div className="episode-links">
                            {ep.links.length} link disponibili
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-episodes">Nessun episodio disponibile</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
