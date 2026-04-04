
import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import GalleryCard from '../components/GalleryCard';
import useAutoRefresh from '../hooks/useAutoRefresh';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

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

      setImages(imagesRes.data);
      setCategories(categoriesRes.data.map(cat => cat.slug || cat.name));
    } catch (error) {
      console.error('Error fetching gallery data:', error);

      try {
        const response = await API.get('/images');
        setImages(response.data);
        const uniqueCategories = [...new Set(response.data.map(img => img.category))];
        setCategories(uniqueCategories);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const { lastRefreshAt, isRefreshing } = useAutoRefresh(() => fetchData(false), {
    intervalMs: 10000
  });

  const filteredImages = selectedCategory
    ? images.filter(img => img.category === selectedCategory)
    : images;

  if (loading) {
    return (
      <div style={styles.loaderWrapper}>
        <div style={styles.spinner}></div>
        <p style={{ color: "#aaa" }}>Loading gallery...</p>
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
  }
};