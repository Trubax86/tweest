import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import ContentRow from './components/ContentRow'
import ContentDialog from './components/ContentDialog'
import VideoPlayer from './components/VideoPlayer'
import HybridContentManager, { HybridContent } from './services/HybridContentManager'

function App() {
  const [hybridMovies, setHybridMovies] = useState<HybridContent[]>([])
  const [hybridSeries, setHybridSeries] = useState<HybridContent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCategory, setCurrentCategory] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<HybridContent[]>([])
  const [selectedContent, setSelectedContent] = useState<HybridContent | null>(null)
  const [heroContent, setHeroContent] = useState<HybridContent | null>(null)
  const [playerUrl, setPlayerUrl] = useState<string | null>(null)
  const [playerTitle, setPlayerTitle] = useState<string>('')
  const [serverOffline, setServerOffline] = useState(false)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      setServerOffline(false)
      
      // Carica da API locale (o proxy)
      const [moviesRes, seriesRes] = await Promise.all([
        axios.get('/api/movies?count=30'),
        axios.get('/api/series?count=30')
      ])

      // Converti in HybridContent con TMDb
      const moviesData = moviesRes.data.success ? moviesRes.data.data : []
      const seriesData = seriesRes.data.success ? seriesRes.data.data : []

      const [hybridMoviesData, hybridSeriesData] = await Promise.all([
        HybridContentManager.getHybridContent(moviesData),
        HybridContentManager.getHybridContent(seriesData)
      ])

      setHybridMovies(hybridMoviesData)
      setHybridSeries(hybridSeriesData)

      // Imposta hero con primo contenuto
      const allContent = [...hybridMoviesData, ...hybridSeriesData]
      if (allContent.length > 0) {
        setHeroContent(allContent[0])
      }

      setLoading(false)
    } catch (error) {
      console.error('[TWEEST] Errore caricamento:', error)
      setServerOffline(true)
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      
      if (res.data.success) {
        const hybridResults = await HybridContentManager.getHybridContent(res.data.data)
        setSearchResults(hybridResults)
        setCurrentCategory('search')
      }
    } catch (error) {
      console.error('[TWEEST] Errore ricerca:', error)
    }
  }

  // Rotazione hero ogni 5 secondi
  useEffect(() => {
    const allContent = [...hybridMovies, ...hybridSeries]
    if (allContent.length === 0) return

    const interval = setInterval(() => {
      setHeroIndex(prev => {
        const next = (prev + 1) % Math.min(allContent.length, 10)
        setHeroContent(allContent[next])
        return next
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [hybridMovies, hybridSeries])


  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>⏳ Caricamento TWEEST...</p>
      </div>
    )
  }

  if (serverOffline) {
    return (
      <div className="server-offline">
        <div className="offline-content">
          <h1>🔴 Server Offline</h1>
          <p>Il server TWEEST non risponde.</p>
          <div className="offline-instructions">
            <h3>💡 Come riavviare il server:</h3>
            <ol>
              <li>Apri la cartella <code>TweestWeb</code></li>
              <li>Esegui <code>restart-server.bat</code></li>
              <li>Attendi 5 secondi</li>
              <li>Ricarica questa pagina</li>
            </ol>
          </div>
          <button className="btn-retry" onClick={() => window.location.reload()}>
            🔄 Riprova
          </button>
        </div>
      </div>
    )
  }

  const handleContentClick = (content: HybridContent) => {
    setSelectedContent(content)
  }

  const handlePlayContent = async (url: string, title: string) => {
    // Se è una pagina CB01 (non un link diretto), estrai il link streaming
    if (url.includes('cb01')) {
      try {
        const response = await axios.get(`/api/streaming-link?url=${encodeURIComponent(url)}`);
        
        if (response.data.success && response.data.url) {
          setPlayerUrl(response.data.url);
          setPlayerTitle(title);
          setSelectedContent(null);
        } else {
          alert('Link streaming non trovato per questo contenuto');
        }
      } catch (error) {
        console.error('[TWEEST] Errore estrazione link:', error);
        alert('Errore durante il caricamento del contenuto');
      }
    } else {
      // Link diretto (episodi, etc.)
      setPlayerUrl(url);
      setPlayerTitle(title);
      setSelectedContent(null);
    }
  }

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1 className="logo">TWEEST</h1>
        
        <nav className="nav">
          <button 
            className={currentCategory === 'home' ? 'active' : ''}
            onClick={() => setCurrentCategory('home')}
          >
            Home
          </button>
          <button 
            className={currentCategory === 'movies' ? 'active' : ''}
            onClick={() => setCurrentCategory('movies')}
          >
            Film
          </button>
          <button 
            className={currentCategory === 'series' ? 'active' : ''}
            onClick={() => setCurrentCategory('series')}
          >
            Serie TV
          </button>
        </nav>

        <div className="search">
          <input
            type="text"
            placeholder="🔍 Cerca film, serie TV..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Cerca</button>
        </div>

        <button 
          className="btn-options"
          onClick={() => window.open('/config.html', '_blank')}
          title="Opzioni TWEEST"
        >
          ⚙️
        </button>
      </header>

      {/* HERO SECTION */}
      {heroContent && currentCategory === 'home' && (
        <div className="hero" style={{ backgroundImage: `url(${heroContent.backdropUrl})` }}>
          <div className="hero-gradient"></div>
          <div className="hero-content">
            <h1 className="hero-title">{heroContent.title}</h1>
            <div className="hero-meta">
              <span className="hero-rating">⭐ {heroContent.rating > 0 ? heroContent.rating.toFixed(1) : 'N/A'}</span>
              <span className="hero-year">{heroContent.year}</span>
              <span className="hero-type">{heroContent.contentType === 'tv' ? '📺 Serie TV' : '🎬 Film'}</span>
            </div>
            <p className="hero-description">
              {heroContent.description.length > 200 
                ? heroContent.description.substring(0, 200) + '...' 
                : heroContent.description}
            </p>
            <div className="hero-buttons">
              {heroContent.hasStreamingLink && heroContent.cb01Url && (
                <button 
                  className="hero-btn hero-btn-play"
                  onClick={() => handlePlayContent(heroContent.cb01Url, heroContent.title)}
                >
                  ▶ Riproduci
                </button>
              )}
              <button 
                className="hero-btn hero-btn-info"
                onClick={() => setSelectedContent(heroContent)}
              >
                ℹ️ Maggiori info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT ROWS */}
      <main className="main">
        {currentCategory === 'home' && (
          <>
            <ContentRow 
              title="🎬 Film Popolari"
              contents={hybridMovies}
              onContentClick={handleContentClick}
            />
            <ContentRow 
              title="📺 Serie TV Popolari"
              contents={hybridSeries}
              onContentClick={handleContentClick}
            />
          </>
        )}

        {currentCategory === 'movies' && (
          <ContentRow 
            title="🎬 Film"
            contents={hybridMovies}
            onContentClick={handleContentClick}
          />
        )}

        {currentCategory === 'series' && (
          <ContentRow 
            title="📺 Serie TV"
            contents={hybridSeries}
            onContentClick={handleContentClick}
          />
        )}

        {currentCategory === 'search' && (
          <>
            <h2 style={{ padding: '40px', color: '#fff', fontSize: '24px' }}>
              🔍 Risultati per "{searchQuery}"
            </h2>
            {searchResults.length > 0 ? (
              <ContentRow 
                title=""
                contents={searchResults}
                onContentClick={handleContentClick}
              />
            ) : (
              <p className="no-results">Nessun risultato trovato</p>
            )}
          </>
        )}
      </main>

      {/* DIALOG */}
      <ContentDialog 
        content={selectedContent}
        onClose={() => setSelectedContent(null)}
        onPlay={handlePlayContent}
      />

      {/* VIDEO PLAYER */}
      {playerUrl && (
        <VideoPlayer
          url={playerUrl}
          title={playerTitle}
          onClose={() => setPlayerUrl(null)}
        />
      )}

      {/* FOOTER */}
      <footer className="footer">
        <p>🎬 TWEEST - Streaming Netflix-Style</p>
      </footer>
    </div>
  )
}

export default App
