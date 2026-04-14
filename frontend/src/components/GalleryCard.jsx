// const GalleryCard = ({ image }) => {
//   const normalizeImageUrl = (url) => {
//     if (!url) return "http://via.placeholder.com/400x300?text=No+Image";

//     const trimmed = url.trim();

//     // absolute URL or protocol
//     if (/^(https?:)?\/\//i.test(trimmed)) {
//       return trimmed;
//     }

//     const withoutUploads = trimmed.replace(/^uploads\//i, "");
//     const withoutLeadingSlash = withoutUploads.replace(/^\//, "");

//     return `http://localhost:5000/uploads/${withoutLeadingSlash}`;
//   };

//   const imageSrc = normalizeImageUrl(image.imageUrl);

//   return (
//     <div className="card h-100 shadow-sm">
//       <img
//         src={imageSrc}
//         alt={image.title || 'gallery image'}
//         className="card-img-top"
//         style={{ height: '200px', objectFit: 'cover' }}
//       />
//       <div className="card-body">
//         <h5 className="card-title">{image.title || 'Untitled'}</h5>
//         <p className="card-text text-muted">{image.category || 'Uncategorized'}</p>
//       </div>
//     </div>
//   );
// };

// export default GalleryCard;


import { useEffect, useState } from "react";

const GalleryCard = ({ image }) => {
  const [imageState, setImageState] = useState("loading");

  const normalizeImageUrl = (url) => {
    if (!url) return null;

    const trimmed = url.trim();

    if (/^(https?:)?\/\//i.test(trimmed)) {
      return trimmed;
    }

    const withoutUploads = trimmed.replace(/^uploads\//i, "");
    const withoutLeadingSlash = withoutUploads.replace(/^\//, "");

    return `http://localhost:5000/uploads/${withoutLeadingSlash}`;
  };

  const optimizeImageUrl = (url) => {
    if (!url) return null;

    if (/cloudinary\.com/i.test(url) && /\/upload\//i.test(url)) {
      return url.replace(
        "/upload/",
        "/upload/f_auto,q_auto,c_fill,g_auto,w_900,h_650/"
      );
    }

    return url;
  };

  const imageSrc = optimizeImageUrl(normalizeImageUrl(image.imageUrl));

  useEffect(() => {
    setImageState("loading");
  }, [imageSrc]);

  if (!imageSrc) return null;

  return (
    <div className="card h-100 shadow-sm gallery-card">
      <div className="gallery-card__media">
        {imageState === "loading" ? (
          <div className="gallery-card__skeleton" aria-hidden="true">
            <span className="gallery-card__spinner"></span>
          </div>
        ) : null}

        {imageState === "error" ? (
          <div className="gallery-card__fallback" aria-hidden="true">
            <span>Image unavailable</span>
          </div>
        ) : null}

        <img
          src={imageSrc}
          alt={image.title || "gallery image"}
          className={`card-img-top gallery-card__image ${imageState === "loaded" ? "is-loaded" : "is-loading"}`}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setImageState("loaded")}
          onError={() => setImageState("error")}
        />

        <div className="gallery-card__overlay">
          <div className="gallery-card__meta">
            <h5 className="gallery-card__title">{image.title || "Untitled"}</h5>
            <p className="gallery-card__category">{image.category || "Creative Collection"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;