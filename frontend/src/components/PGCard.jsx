import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPGImages } from "@/utils/pgImage";
import "./PropertyCard.css";

export const PGCard = ({ pg, index = 0 }) => {
  const pgId = pg._id || pg.id;
  const images = getPGImages(pg);
  const [liked, setLiked] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const safeRating = Number(pg.rating || 0);
  const freeCancellation = pg.freeCancellation !== false;

  useEffect(() => {
    if (currentImg >= images.length) {
      setCurrentImg(0);
    }
  }, [currentImg, images.length]);

  const prevImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1) % images.length);
  };

  const roomLabel = pg.occupancy || pg.sharing || "Double sharing";
  const priceLabel = Number(pg.price || 0).toLocaleString("en-IN");

  return (
    <Link
      to={`/pg/${pgId}`}
      className="group block cursor-pointer"
      style={{ animationDelay: `${index * 60}ms` }}
      data-testid={`pg-card-${pgId}`}
    >
      <div className="property-card" data-testid={`property-card-${pgId}`}>
        <div className="card-image-wrapper">
          <img src={images[currentImg]} alt={pg.title} className="card-image" loading="lazy" />

          <button
            type="button"
            className={`heart-btn ${liked ? "liked" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLiked((prev) => !prev);
            }}
            aria-label="Save to wishlist"
          >
            <svg viewBox="0 0 32 32" className="heart-icon" aria-hidden="true">
              <path d="M16 28C16 28 3 20.5 3 11.5C3 7.358 6.358 4 10.5 4C12.951 4 15.122 5.195 16 7C16.878 5.195 19.049 4 21.5 4C25.642 4 29 7.358 29 11.5C29 20.5 16 28 16 28Z" />
            </svg>
          </button>

          <div className="guest-favourite-pill">Guest favourite</div>

          {images.length > 1 && (
            <>
              <button className="nav-btn nav-prev" onClick={prevImg} aria-label="Previous image" type="button">
                <svg viewBox="0 0 32 32" width="12" height="12" aria-hidden="true">
                  <path d="M20 28 8 16 20 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="nav-btn nav-next" onClick={nextImg} aria-label="Next image" type="button">
                <svg viewBox="0 0 32 32" width="12" height="12" aria-hidden="true">
                  <path d="M12 4 24 16 12 28" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="dot-row">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`dot ${i === currentImg ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImg(i);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card-info">
          <div className="card-top-row">
            <span className="card-location">{pg.title}</span>
            <span className="card-rating">
              <svg viewBox="0 0 32 32" width="12" height="12" className="star-icon" aria-hidden="true">
                <path d="M16 2l3.09 9.26H29l-8.09 5.88 3.09 9.26L16 21.52l-7.99 4.88 3.09-9.26L3 11.26h9.91z" />
              </svg>
              {safeRating.toFixed(1)}
            </span>
          </div>

          <p className="card-title">{pg.location}</p>

          <p className="card-meta">
            {roomLabel} · {pg.type || "PG"}
          </p>

          <p className="card-price">
            <span className="price-amount">₹{priceLabel}</span> <span className="price-nights">/ month</span>
          </p>

          {freeCancellation && <span className="free-cancel">Free cancellation</span>}
        </div>
      </div>
    </Link>
  );
};
