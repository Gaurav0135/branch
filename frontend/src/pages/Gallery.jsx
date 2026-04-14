
import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import GalleryCard from '../components/GalleryCard';
import useAutoRefresh from '../hooks/useAutoRefresh';

const GALLERY_CACHE_KEY = 'frameza_gallery_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [usingCachedData, setUsingCachedData] = useState(false);

  const readCachedGallery = useCallback(() => {
    try {
      const cachedRaw = sessionStorage.getItem(GALLERY_CACHE_KEY);
      if (!cachedRaw) return false;
      const cached = JSON.parse(cachedRaw);
      const isFresh = Date.now() - Number(cached.timestamp || 0) < CACHE_TTL_MS;
      if (!isFresh || !Array.isArray(cached.images) || !Array.isArray(cached.categories)) return false;
      setImages(cached.images);
      setCategories(cached.categories);
      setUsingCachedData(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const writeCachedGallery = useCallback((nextImages, nextCategories) => {
    try {
      sessionStorage.setItem(
        GALLERY_CACHE_KEY,
        JSON.stringify({ images: nextImages, categories: nextCategories, timestamp: Date.now() })
      );
    } catch {
      // Ignore cache write errors.
    }
  }, []);

  const formatRefreshText = (timestamp) => {
    if (!timestamp) return 'Waiting for next sync...';
    const secondsAgo = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (secondsAgo < 5) return 'Updated just now';
    if (secondsAgo < 60) return `Updated ${secondsAgo}s ago`;
    return `Updated ${Math.floor(secondsAgo / 60)}m ago`;
  };

  const fetchData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const [imagesRes, categoriesRes] = await Promise.all([
        API.get('/images'),
        API.get('/categories')
      ]);

      const nextImages = imagesRes.data;
      const nextCategories = categoriesRes.data.map(cat => cat.slug || cat.name);
      setImages(nextImages);
      setCategories(nextCategories);
      writeCachedGallery(nextImages, nextCategories);
      setUsingCachedData(false);
    } catch (error) {
      console.error('Error fetching gallery data:', error);

      try {
        const response = await API.get('/images');
        const nextImages = response.data;
        const uniqueCategories = [...new Set(nextImages.map(img => img.category))];
        setImages(nextImages);
        setCategories(uniqueCategories);
        writeCachedGallery(nextImages, uniqueCategories);
        setUsingCachedData(false);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [writeCachedGallery]);

  useEffect(() => {
    const hasFreshCache = readCachedGallery();
    if (hasFreshCache) {
      setLoading(false);
      fetchData(false);
      return;
    }
    fetchData(true);
  }, [fetchData, readCachedGallery]);

  const { lastRefreshAt, isRefreshing } = useAutoRefresh(() => fetchData(false), {
    intervalMs: 10000
  });

  const filteredImages = selectedCategory
    ? images.filter(img => img.category === selectedCategory)
    : images;

  const loaderCards = Array.from({ length: 6 }, (_, index) => index);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Frameza Gallery</h1>
            <p style={styles.subtitle}>Preparing your gallery previews...</p>
          </div>

          <div style={styles.loadingGrid}>
            {loaderCards.map((cardIndex) => (
              <div key={cardIndex} className="gallery-skeleton-card">
                <div className="gallery-skeleton-card__media"></div>
                <div className="gallery-skeleton-card__body">
                  <div className="gallery-skeleton-line gallery-skeleton-line--title"></div>
                  <div className="gallery-skeleton-line gallery-skeleton-line--text"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Heading */}
        <div style={styles.header}>
          <h1 style={styles.title}>Frameza Gallery</h1>
          <p style={styles.subtitle}>
            Explore our creative collections across different categories
          </p>
          <small style={styles.refreshText}>
            {isRefreshing ? 'Refreshing...' : formatRefreshText(lastRefreshAt)}
          </small>
          {usingCachedData ? (
            <small style={styles.cachedText}>Showing cached data while refreshing...</small>
          ) : null}
        </div>

        {/* Filters */}
        <div style={styles.filterWrapper}>
          <button
            style={{
              ...styles.filterBtn,
              ...(selectedCategory === "" && styles.activeBtn)
            }}
            onClick={() => setSelectedCategory("")}
          >
            All
          </button>

          {categories.map(cat => (
            <button
              key={cat}
              style={{
                ...styles.filterBtn,
                ...(selectedCategory === cat && styles.activeBtn)
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div style={styles.grid}>
          {filteredImages.map(image => (
            <GalleryCard key={image._id} image={image} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Gallery;

//////////////////////////////////////////////////////////

const styles = {
  page: {
    background: "linear-gradient(135deg, #0f0f0f, #1c1c1c)",
    minHeight: "100vh",
    color: "#fff",
    padding: "20px"
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto"
  },

  header: {
    textAlign: "center",
    marginBottom: "clamp(25px, 5vw, 40px)"
  },

  title: {
    fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "10px"
  },

  subtitle: {
    color: "#aaa",
    fontSize: "clamp(0.9rem, 2.5vw, 1rem)"
  },

  refreshText: {
    color: "#888",
    display: "block",
    marginTop: "8px"
  },

  cachedText: {
    color: "#f0c36d",
    display: "block",
    marginTop: "4px"
  },

  filterWrapper: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "clamp(25px, 5vw, 40px)"
  },

  filterBtn: {
    background: "transparent",
    border: "1px solid #444",
    padding: "clamp(6px, 2vw, 8px) clamp(12px, 3vw, 18px)",
    borderRadius: "25px",
    color: "#ccc",
    cursor: "pointer",
    transition: "0.3s",
    fontSize: "clamp(0.8rem, 2vw, 0.95rem)",
    whiteSpace: "nowrap"
  },

  activeBtn: {
    background: "linear-gradient(45deg, #ff4d4d, #ff7b00)",
    color: "#fff",
    border: "none"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(clamp(200px, 100%, 280px), 1fr))",
    gap: "clamp(12px, 3vw, 20px)"
  },

  loaderWrapper: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#111"
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #333",
    borderTop: "4px solid #ff7b00",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "10px"
  },

  loadingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(clamp(200px, 100%, 280px), 1fr))",
    gap: "clamp(12px, 3vw, 20px)"
  }
};