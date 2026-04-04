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


import { useState } from "react";

const GalleryCard = ({ image }) => {
  const [visible, setVisible] = useState(true);

  const normalizeImageUrl = (url) => {
    if (!url) return null; // ❌ don't show placeholder, skip card

    const trimmed = url.trim();

    // ✅ Cloudinary / external URL
    if (/^(https?:)?\/\//i.test(trimmed)) {
      return trimmed;
    }

    // ✅ Local image handling
    const withoutUploads = trimmed.replace(/^uploads\//i, "");
    const withoutLeadingSlash = withoutUploads.replace(/^\//, "");

    return `http://localhost:5000/uploads/${withoutLeadingSlash}`;
  };

  const imageSrc = normalizeImageUrl(image.imageUrl);

  // ❌ If no valid URL → don't render
  if (!imageSrc || !visible) return null;

  return (
    <div className="card h-100 shadow-sm">
      <img
        src={imageSrc}
        alt={image.title || "gallery image"}
        className="card-img-top"
        style={{ height: "200px", objectFit: "cover" }}
        onError={() => setVisible(false)} // 🔥 MAIN FIX
      />

      <div className="card-body">
        <h5 className="card-title">
          {image.title || "Untitled"}
        </h5>
        <p className="card-text text-muted">
          {image.category || "Creative Collection"}
        </p>
      </div>
    </div>
  );
};

export default GalleryCard;