import type { Metadata } from 'next'
import NationalStartupMap from '@/components/startups/NationalStartupMap'
import './startups.css'
import './national.css'
import 'leaflet/dist/leaflet.css'
import './street.css'

export const metadata: Metadata = {
  title: 'U.S. Startup Atlas | Bear Brown & Co.',
  description: 'Explore U.S. startup discovery on a street map, with program affiliations, source evidence and separate SEC research layers. AI and hiring review are pending.',
  alternates: { canonical: 'https://www.bearbrown.co/startups' },
}

export default function StartupsPage() {
  return <div className="startup-atlas national-atlas">
    <header className="atlas-intro">
      <div className="atlas-kicker">FIELD NOTES / 002 <span>UNITED STATES · 50 STATES + DC</span></div>
      <div className="atlas-title-row"><div><h1>Find the next<br /><em>place to build.</em></h1>
        <p className="atlas-deck">A startup atlas for finding where AI skills could matter. First, find the companies. Then follow the evidence in their products and job postings.</p></div>
        <div className="atlas-edition"><span className="atlas-status">● DISCOVERY EDITION</span><strong>2 November 2026</strong><p>Source-backed geography.<br />AI and hiring review pending.</p><a href="#method">Read the method ↗</a></div></div>
      <p className="atlas-definition"><strong>A starting collection, not a census.</strong> YC startup records are directory-reported. Boston research leads are clearly labeled; SEC issuers remain separate research layers. Neither is confirmed as active startups.</p>
    </header>
    <NationalStartupMap />
    <section id="method" className="atlas-method" aria-labelledby="method-title">
      <div><div className="atlas-kicker">READ THE MAP</div><h2 id="method-title">Evidence before labels.</h2><p>Pan, zoom and jump between startup hubs. Filled dots mark reported street addresses. Outlined dots mark approximate ZIP areas, not offices. City-only groups are optional and switched off initially. Select a group to see its companies, or use the address inspector to browse individual source claims, historical evidence and records without coordinates. Blank areas mean no mapped evidence in this collection.</p><a href="/startups/bay-area">Explore the earlier Bay Area evidence study ↗</a><p><a href="/data/startups/national.json" download>Download directory & coverage · JSON ↗</a></p></div>
      <div className="atlas-method-grid">
        <article><h3>01 / A U.S. foundation</h3><p>The existing YC discovery snapshot supplies companies marked active, for profit, and in the United States. This is a community mirror of directory information, checked on 31 October 2026; activity and locations need independent confirmation. Boston leads retain their original source evidence. Exact, unambiguous website-domain matches combine records; shared domains are flagged for review.</p></article>
        <article><h3>02 / Filings are leads</h3><p>Form D covers exempt securities offerings. Form C covers crowdfunding offerings, including ordinary small businesses. The SEC layers count unique primary issuers with a latest filing since January 2024, through September 2026. Funds, ambiguous vehicles, real-estate categories, and withdrawn or reporting-terminated Form C records are held out. These filters do not establish startup status, current activity or final money raised. CIK overlap across forms is not added together.</p></article>
        <article id="location-method"><h3>03 / Location has limits</h3><p>Company-published addresses add evidence to 63 existing exact-domain matches from the Humanitarians.ai ecosystem map. Street pins require reviewed evidence and a consistent geocoder match. Census geocodes interpolate street ranges; they do not verify occupancy. Legal and mailing addresses use approximate Census ZIP-area reference points when available. Historical or conflicting evidence stays in the address inspector without an unsupported office pin. Legal/mailing and unit-style private-use indicators show only an approximate area; street details are withheld pending review. Distinct reported facilities may have separate positions; shared positions list every company. City-only records remain searchable and can be shown as optional GeoNames groups. The opening view maximizes unique records within 25 km of each matched city point; it reflects this collection’s sampling, not a comprehensive startup-density estimate. 17 records remain unplaced. SEC layers remain state-level only.</p><p><a href="/data/startups/enrichment.json">Download address review & careers evidence ↗</a></p><p><a href="/data/startups/locations.json">Download location evidence & density calculation ↗</a></p></article>
        <article><h3>04 / AI review comes next</h3><p>No new AI classification or hiring inference has been made. The next pass will attach dated product and job evidence to “primarily AI” or “uses AI skills.” “No AI evidence” will describe a reviewed scope, never prove a company has no AI. Unreviewed companies remain unknown. Employer matching must resolve domains and legal names before linking job archives.</p></article>
      </div>
      <div className="atlas-source-line"><strong>Sources & geography</strong><a href="https://www.ycombinator.com/companies">YC directory</a><a href="https://github.com/yc-oss/api">YC discovery mirror</a><a href="https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets">SEC Form D</a><a href="https://www.sec.gov/data-research/sec-markets-data/crowdfunding-offerings-data-sets">SEC Form C</a><a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth · public domain</a><a href="https://jobs.humanitarians.ai/ecosystem">Humanitarians.ai · address evidence</a><a href="https://www.geonames.org/">GeoNames · CC BY 4.0</a><a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a><span>Leaflet street map · D3 SEC state layers</span></div>
    </section>
  </div>
}
