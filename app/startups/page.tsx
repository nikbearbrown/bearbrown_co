import type { Metadata } from 'next'
import StartupMap from '@/components/startups/StartupMap'
import { startupMeta } from '@/lib/startup-map'
import './startups.css'

export const metadata: Metadata = {
  title: 'Bay Area AI Startup Map | Bear Brown & Co.',
  description: 'Explore a sourced D3 map of Bay Area AI agent startups. City-level counts, product evidence, activity checks, and downloadable research.',
  alternates: { canonical: 'https://www.bearbrown.co/startups' },
}

export default function StartupsPage() {
  return <div className="startup-atlas">
    <header className="atlas-intro">
      <div className="atlas-kicker">FIELD NOTES / 001 <span>BAY AREA · CALIFORNIA</span></div>
      <div className="atlas-title-row">
        <div><h1>Where agents<br /><em>are being built.</em></h1>
          <p className="atlas-deck">An AI startup map with the evidence left in. Explore the companies building agents that do work, and the tools that make them possible.</p>
        </div>
        <div className="atlas-edition"><span className="atlas-status">● RESEARCH SNAPSHOT</span><strong>31 October 2026</strong><p>A curated starting collection.<br />Every circle is a city, not an office.</p><a href="#method">Read the method ↗</a></div>
      </div>
      <p className="atlas-definition"><strong>What counts as an agent?</strong> A primary product that carries out multistep tasks through tools or computer interfaces, according to its own website. Builders and infrastructure form a separate layer.</p>
    </header>
    <StartupMap />
    <section id="method" className="atlas-method" aria-labelledby="method-title">
      <div><div className="atlas-kicker">READ THE MAP</div><h2 id="method-title">Precision is a promise.</h2><p>The dots belong to cities. They do not tell you where a company rents an office. A bigger circle means more companies in this collection, not a denser neighborhood.</p><a href="/data/startups/companies.json" download>Download the complete evidence · JSON ↗</a></div>
      <div className="atlas-method-grid">
        <article><h3>01 / A bounded collection</h3><p>{startupMeta.scope} Discovery used the public YC directory and company sites; there is no paid database export behind this edition. Missing cities do not mean there are no startups there.</p></article>
        <article><h3>02 / Independent verification</h3><p>{startupMeta.verification_policy} {startupMeta.review_method} “Source-reviewed” means the cited pages were inspected; it is not a certification of product performance, office occupancy, or corporate status. Confidence labels describe the clarity of the cited product claim.</p></article>
        <article><h3>03 / Location without invention</h3><p>{startupMeta.location_policy} For future address work, inspect the latest Form D, then DataSF, then a company office or job address. Validate that it is an operating location, not a registered agent or home, before pinning it.</p></article>
        <article><h3>04 / Activity has an expiry</h3><p>{startupMeta.activity_policy} All websites and sources were checked on {startupMeta.as_of}. Recheck sources before relying on a company’s location or hiring status.</p></article>
      </div>
      <div className="atlas-source-line"><strong>Sources & geography</strong><a href="https://www.ycombinator.com/companies">YC directory</a><a href="https://github.com/yc-oss/api">yc-oss discovery data</a><a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth land · public domain</a><span>D3 geographic projection · city reference points are approximate</span></div>
    </section>
  </div>
}
