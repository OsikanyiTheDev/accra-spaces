import Link from "next/link";
import { Icon } from "@/components/icons";

export function HomeSections() {
  return (
    <>
      <section className="clarity-strip" aria-label="What Accra Spaces makes clear">
        <div className="shell clarity-grid">
          <article>
            <span className="clarity-icon"><Icon name="tag" size={22} /></span>
            <div><h3>No hidden terms</h3><p>Deposit, maintenance and agent commission are structured fields—not surprises in a chat.</p></div>
          </article>
          <article>
            <span className="clarity-icon"><Icon name="sun" size={22} /></span>
            <div><h3>See day and night</h3><p>Compare street visibility and lighting before making time for a visit.</p></div>
          </article>
          <article>
            <span className="clarity-icon"><Icon name="whatsapp" size={22} /></span>
            <div><h3>Contact your way</h3><p>Move from clear listing detail to WhatsApp, call or a structured viewing request.</p></div>
          </article>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="shell">
          <div className="centered-heading">
            <span className="section-kicker">Simple by design</span>
            <h2>From search to viewing in three clear steps</h2>
            <p>Less back-and-forth. More useful information before you leave home.</p>
          </div>
          <div className="steps-grid">
            <article><span className="step-number">01</span><div className="step-icon"><Icon name="search" size={24} /></div><h3>Search locally</h3><p>Filter by Greater Accra area, property type, rent or sale, budget and bedrooms.</p></article>
            <article><span className="step-number">02</span><div className="step-icon"><Icon name="building" size={24} /></div><h3>Compare clearly</h3><p>Review GHS price, deposit months, maintenance responsibility and day/night context.</p></article>
            <article><span className="step-number">03</span><div className="step-icon"><Icon name="calendar" size={24} /></div><h3>Arrange the visit</h3><p>Propose a viewing time or continue on WhatsApp when that is faster.</p></article>
          </div>
        </div>
      </section>

      <section className="safety-section" id="safety">
        <div className="shell safety-card">
          <div className="safety-copy">
            <span className="eyebrow eyebrow-light"><Icon name="shield" size={16} /> Safer decisions start with clarity</span>
            <h2>View first. Verify identity and ownership. Pay later.</h2>
            <p>Accra Spaces is an independent development platform—not an authority, agency or emergency service. A completeness badge describes listing information; it does not verify a person or property.</p>
            <div className="safety-points">
              <span><Icon name="check" size={16} /> Never pay a viewing fee</span>
              <span><Icon name="check" size={16} /> Confirm terms in writing</span>
              <span><Icon name="check" size={16} /> Verify before any deposit</span>
            </div>
          </div>
          <div className="safety-mark" aria-hidden="true"><Icon name="shield" size={96} /></div>
        </div>
      </section>

      <section className="post-cta-section">
        <div className="shell post-cta">
          <div><span className="section-kicker">For landlords and agents</span><h2>Present the full picture, once.</h2><p>Use structured terms and separate day/night photo slots to make a space easier to understand before the first message.</p></div>
          <Link className="button button-gold" href="/post">Start a listing <Icon name="arrow-right" size={17} /></Link>
        </div>
      </section>
    </>
  );
}
