import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import "../gallery-notifications.css";

const GALLERY_CACHE_KEY = "frameza_admin_gallery_cache_v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [uploadingFile, setUploadingFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usingCachedData, setUsingCachedData] = useState(false);

  const readCachedImages = useCallback(() => {
    try {
      const cachedRaw = sessionStorage.getItem(GALLERY_CACHE_KEY);
      if (!cachedRaw) return false;
      const cached = JSON.parse(cachedRaw);
      const isFresh = Date.now() - Number(cached.timestamp || 0) < CACHE_TTL_MS;
      if (!isFresh || !Array.isArray(cached.data)) return false;
      setImages(cached.data);
      const cats = [...new Set(cached.data.map((img) => img.category))];
      setCategories(cats);
      setUsingCachedData(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const writeCachedImages = useCallback((data) => {
    try {
      sessionStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
      // Ignore cache write errors.
    }
  }, []);

  const fetchImages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await API.get("/images");
      const nextImages = res.data;
      setImages(nextImages);
      
      const cats = [...new Set(nextImages.map(img => img.category))];
      setCategories(cats);
      writeCachedImages(nextImages);
      setUsingCachedData(false);
    } catch (err) {
      setError("Failed to load images");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [writeCachedImages]);

  useEffect(() => {
    const hasFreshCache = readCachedImages();
    if (hasFreshCache) {
      setLoading(false);
      fetchImages(true);
      return;
    }
    fetchImages(false);
  }, [fetchImages, readCachedImages]);

  const filteredImages = selectedCategory === "all" 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadingFile) {
      setSuccess("");
      setError("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append("image", uploadingFile);
    formData.append("title", e.target.title?.value || "Untitled");
    formData.append("category", e.target.category?.value || "uncategorized");

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      const res = await API.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages([...images, res.data]);
      setError("");
      setSuccess("Image uploaded successfully!");
      e.target.reset();
      setUploadingFile(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.msg || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (image) => {
    setEditingId(image._id);
    setEditTitle(image.title);
    setEditCategory(image.category);
  };

  const handleSaveEdit = async (id) => {
    try {
      setError("");
      setSuccess("");
      const res = await API.put(`/images/${id}`, {
        title: editTitle,
        category: editCategory,
      });
      setImages(images.map(img => img._id === id ? res.data.image : img));
      setEditingId(null);
      setError("");
      setSuccess("Image updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.msg || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      setError("");
      setSuccess("");
      await API.delete(`/images/${id}`);
      setImages(images.filter(img => img._id !== id));
      setError("");
      setSuccess("Image deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.msg || "Delete failed");
    }
  };

  return (
    <div className="admin-page-block">
      <div className="page-header">
        <h2>Gallery Management</h2>
        <p>Manage images by category</p>
        {usingCachedData ? <small className="text-warning">Showing cached data while refreshing...</small> : null}
      </div>

      {error && (
        <div className="gallery-alert gallery-alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}
      {success && (
        <div className="gallery-alert gallery-alert-success" role="status" aria-live="polite">
          <strong>Success:</strong> {success}
        </div>
      )}

      {/* Upload Form */}
      <div className="table-card" style={{ marginBottom: "2rem" }}>
        <div style={{ padding: "1.5rem" }}>
          <h4 style={{ marginBottom: "1rem" }}>Upload New Image</h4>
          <form onSubmit={handleUpload}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Image File</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setUploadingFile(e.target.files[0])}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  placeholder="Image title"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  name="category"
                  placeholder="e.g., wedding, fashion, events"
                />
              </div>
              <div className="col-md-6" style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          className={`btn ${selectedCategory === "all" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setSelectedCategory("all")}
          size="sm"
        >
          All ({images.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn ${selectedCategory === cat ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setSelectedCategory(cat)}
            size="sm"
          >
            {cat} ({images.filter(img => img.category === cat).length})
          </button>
        ))}
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="page-state">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading images...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="page-state">
          <p>No images found in this category</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {filteredImages.map(image => (
            <div key={image._id} className="table-card" style={{ padding: "0", overflow: "hidden" }}>
              <img
                src={image.imageUrl}
                alt={image.title}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <div style={{ padding: "1rem" }}>
                {editingId === image._id ? (
                  <>
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        placeholder="Category"
                      />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-success btn-sm flex-grow-1"
                        onClick={() => handleSaveEdit(image._id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm flex-grow-1"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h6 style={{ marginBottom: "0.5rem", color: "var(--admin-text)" }}>
                      {image.title}
                    </h6>
                    <p style={{ color: "var(--admin-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                      <span className="badge bg-secondary">{image.category}</span>
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-warning btn-sm flex-grow-1"
                        onClick={() => handleEdit(image)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm flex-grow-1"
                        onClick={() => handleDelete(image._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
