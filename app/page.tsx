import { Brain, Rocket, Users } from 'lucide-react'
import SpotifyPlayer from '@/components/SpotifyPlayer/SpotifyPlayer'

const buttonStyles =
  'inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-black text-white shadow hover:bg-gray-800 dark:border dark:border-input dark:bg-background dark:text-foreground dark:shadow-sm dark:hover:bg-accent dark:hover:text-accent-foreground'

const SERVICES = [
  {
    icon: Brain,
    title: 'AI Consulting',
    description:
      'Direct AI consulting for startups and enterprises. Strategy, implementation, and hands-on build support.',
    link: { label: 'Get in touch →', href: 'mailto:bear@bearbrown.co' },
  },
  {
    icon: Rocket,
    title: 'Angel Advising',
    description:
      'I advise early-stage startups in exchange for equity. Deep AI expertise, network access, and long-term skin in the game.',
    link: { label: 'Learn more →', href: 'mailto:bear@bearbrown.co' },
  },
  {
    icon: Users,
    title: 'Talent Connector',
    description:
      'I connect startups with exceptional recent engineering grads — top-tier talent at entry-level prices.',
    link: { label: 'Find talent →', href: 'mailto:bear@bearbrown.co' },
  },
]

const CONNECT_LINKS = [
  { name: 'Substack', href: 'https://bearbrownco.substack.com/' },
  { name: 'YouTube', href: 'https://www.youtube.com/@NikBearBrown' },
  { name: 'GitHub', href: 'https://github.com/nikbearbrown' },
  { name: 'Humanitarians AI', href: 'https://humanitarians.ai' },
]

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Nik Bear Brown
              </h1>
              <p className="text-xl font-medium text-foreground/80">
                AI Consultant, Angel Advisor &amp; Talent Connector
              </p>
              <p className="max-w-[540px] text-lg text-muted-foreground leading-relaxed">
                I help startups move faster with AI — as a consultant, an angel advisor
                (equity for expertise), and a connector to top recent engineering grads
                at entry-level prices.
              </p>
              <div className="flex flex-col gap-3 min-[400px]:flex-row pt-2">
                <a href="mailto:bear@bearbrown.co" className={buttonStyles}>
                  Work With Me
                </a>
                <a
                  href="https://bearbrownco.substack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles}
                >
                  Read My Writing
                </a>
              </div>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.youtube.com/embed/GN7yQntWJHU"
                title="Nik Bear Brown"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What I Do Section */}
      <section className="w-full py-16 md:py-24 bg-muted/40">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              What I Do
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="rounded-lg border bg-card p-8 shadow-sm flex flex-col"
              >
                <service.icon className="h-10 w-10 mb-4 text-foreground" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  {service.description}
                </p>
                <a
                  href={service.link.href}
                  className="mt-6 text-sm font-medium text-foreground hover:underline"
                >
                  {service.link.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="w-full py-16 md:py-24 bg-foreground text-background">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
            Let&apos;s Collaborate
          </h2>
          <p className="max-w-[600px] mx-auto text-background/70 text-lg mb-8">
            Whether you need AI strategy, a technical advisor on your cap table,
            or your next great hire — let&apos;s talk.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {CONNECT_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors border border-background/30 text-background hover:bg-background/10"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Spotify Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl text-center mb-2">
              Nik Bear Brown — Poet and Songwriter
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Music and spoken word across genres and collaborations.
            </p>
            <SpotifyPlayer />
          </div>
        </div>
      </section>
    </div>
  )
}
