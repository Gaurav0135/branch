import { Link } from 'react-router-dom';
import Hero from '../assets/Hero.png';
import WeddingAsset from '../assets/w7.jpg';
import PreWeddingAsset from '../assets/pre-wedding.jpg';
import FashionAsset from '../assets/f1.jpg';
import EventsAsset from '../assets/e2.jpg';
import CommercialAsset from '../assets/w7.jpg';

const ServiceCard = ({ service }) => {
  const localImageMap = {
    wedding: WeddingAsset,
    'wedding photography': WeddingAsset,
    'pre-wedding': PreWeddingAsset,
    'pre-wedding shoot': PreWeddingAsset,
    fashion: FashionAsset,
    'fashion portfolio': FashionAsset,
    events: EventsAsset,
    'event coverage': EventsAsset,
    commercial: CommercialAsset,
    'commercial product': CommercialAsset
  };

  const imageSrc = service.imageUrl
    ? `http://localhost:5000/uploads/${service.imageUrl}`
    : localImageMap[(service.category || '').toLowerCase()] || localImageMap[(service.title || '').toLowerCase()] || Hero;

  return (
    <div className="card h-100 service-card shadow-lg border-0 overflow-hidden">
      <div className="service-card-img-wrap position-relative">
        <img
          src={imageSrc}
          alt={service.title}
          className="service-card-img"
        />
        <div className="service-card-overlay"></div>
        <div className="service-card-headline text-white p-3">
          <h3 className="mb-1">{service.title}</h3>
          <small className="badge bg-warning text-dark">{service.category || 'Signature Service'}</small>
        </div>
      </div>
      <div className="card-body d-flex flex-column">
        <p className="card-text flex-grow-1 text-white opacity-90">{service.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-4">
          <span className="h4 text-info mb-0">Rs {service.price}</span>
          <Link to="/booking" className="btn btn-light btn-sm text-dark fw-bold">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;