import { Icon } from "@/components/icons";
import { SaveSearchButton } from "@/components/save-search-button";
import { AREAS, PROPERTY_TYPES } from "@/lib/constants";
import type { SearchParams } from "@/lib/types";

export function HeroSearch({ params }: { params: SearchParams }) {
  return (
    <section className="hero">
      <div className="hero-orbit orbit-one" aria-hidden="true" />
      <div className="hero-orbit orbit-two" aria-hidden="true" />
      <div className="shell hero-inner">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> Built for Greater Accra</span>
          <h1>A clearer way to find your <em>next space.</em></h1>
          <p>Compare homes, shops and offices with prices, terms and day-to-night context upfront—then arrange a viewing the way Accra already communicates.</p>
          <div className="hero-trust-row" aria-label="Product strengths">
            <span><Icon name="check" size={15} /> GHS pricing</span>
            <span><Icon name="check" size={15} /> Clear agent terms</span>
            <span><Icon name="check" size={15} /> WhatsApp-first</span>
          </div>
        </div>

        <div className="search-card" id="search">
          <div className="search-card-heading">
            <div>
              <span className="section-kicker">Find a space</span>
              <h2>What are you looking for?</h2>
            </div>
            <span className="search-local"><Icon name="map-pin" size={15} /> Greater Accra</span>
          </div>
          <form action="/" className="search-form">
            <label className="field field-wide">
              <span>Area or neighbourhood</span>
              <div className="field-control">
                <Icon name="map-pin" size={18} />
                <select name="area" defaultValue={params.area ?? ""}>
                  <option value="">Anywhere in Greater Accra</option>
                  {AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
                <Icon name="chevron-down" size={15} />
              </div>
            </label>
            <label className="field">
              <span>Property type</span>
              <div className="field-control">
                <Icon name="building" size={18} />
                <select name="type" defaultValue={params.type ?? ""}>
                  <option value="">Any type</option>
                  {PROPERTY_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
                <Icon name="chevron-down" size={15} />
              </div>
            </label>
            <label className="field">
              <span>Looking to</span>
              <div className="field-control">
                <Icon name="tag" size={18} />
                <select name="mode" defaultValue={params.mode ?? ""}>
                  <option value="">Rent or buy</option>
                  <option value="rent">Rent</option>
                  <option value="sale">Buy</option>
                </select>
                <Icon name="chevron-down" size={15} />
              </div>
            </label>
            <label className="field">
              <span>Minimum price</span>
              <div className="field-control price-control">
                <b>GH₵</b>
                <input name="min_price" type="number" min="1" placeholder="No min" defaultValue={params.min_price ?? ""} />
              </div>
            </label>
            <label className="field">
              <span>Maximum price</span>
              <div className="field-control price-control">
                <b>GH₵</b>
                <input name="max_price" type="number" min="1" placeholder="No max" defaultValue={params.max_price ?? ""} />
              </div>
            </label>
            <label className="field">
              <span>Bedrooms</span>
              <div className="field-control">
                <Icon name="bed" size={18} />
                <select name="beds" defaultValue={params.beds ?? ""}>
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
                <Icon name="chevron-down" size={15} />
              </div>
            </label>
            <button className="button button-gold search-submit" type="submit">
              <Icon name="search" size={18} /> Search spaces
            </button>
          </form>
          <SaveSearchButton params={params} />
        </div>
      </div>
    </section>
  );
}
