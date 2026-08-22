export default function Loading() {
  return (
    <section className="detail-loading shell" aria-label="Loading listing">
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-gallery" />
      <div className="skeleton skeleton-content" />
    </section>
  );
}
