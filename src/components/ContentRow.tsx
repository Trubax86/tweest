import { useRef, useState } from 'react';
import './ContentRow.css';
import { HybridContent } from '../services/HybridContentManager';

interface ContentRowProps {
  title: string;
  contents: HybridContent[];
  onContentClick: (content: HybridContent) => void;
}

export default function ContentRow({ title, contents, onContentClick }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 800;
    const newScrollLeft = direction === 'left'
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <div className="content-row">
      <h2 className="row-title">{title}</h2>
      
      <div className="row-container">
        {/* LEFT ARROW */}
        {showLeftArrow && (
          <button 
            className="row-arrow row-arrow-left"
            onClick={() => scroll('left')}
          >
            ‹
          </button>
        )}

        {/* CONTENT SCROLL */}
        <div 
          className="row-scroll" 
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {contents.map((content, index) => (
            <div 
              key={`${content.cb01Url}-${index}`}
              className="row-card"
              onClick={() => onContentClick(content)}
            >
              <img 
                src={content.posterUrl}
                alt={content.title}
                onError={(e) => {
                  // Fallback: usa placehold.co invece di via.placeholder.com
                  e.currentTarget.src = 'https://placehold.co/300x450/1a1a1a/e50914?text=' + encodeURIComponent(content.title.substring(0, 20));
                }}
              />
              <div className="row-card-overlay">
                <h3>{content.title}</h3>
                <div className="row-card-meta">
                  {content.rating > 0 && (
                    <span className="row-card-rating">
                      ⭐ {content.rating.toFixed(1)}
                    </span>
                  )}
                  {content.year && (
                    <span className="row-card-year">{content.year}</span>
                  )}
                </div>
                <button className="row-card-play">▶ Play</button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT ARROW */}
        {showRightArrow && (
          <button 
            className="row-arrow row-arrow-right"
            onClick={() => scroll('right')}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
