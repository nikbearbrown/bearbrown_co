import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - Bear Brown',
  description: 'Nik Bear Brown — professor, educator, artist, musician, and AI innovator at Northeastern University.',
}

export default function AboutPage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter mb-8">About</h1>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <p>
              Nik Bear Brown is a professor at Northeastern University, where he teaches courses on AI, machine learning,
              and prompt engineering. His work sits at the intersection of technology, education, and creative expression —
              building tools that make AI accessible and useful for educators, students, and communities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Academic Role</h2>
            <p>
              At Northeastern, Bear teaches graduate and undergraduate courses spanning deep learning, generative AI,
              and data science. He emphasizes hands-on learning and real-world applications, helping students bridge
              the gap between theory and practice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Writing &amp; Speaking</h2>
            <p>
              Bear writes regularly for{' '}
              <a href="https://www.edsurge.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                EdSurge
              </a>{' '}
              and contributes to{' '}
              <a href="https://www.iste.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                ISTE+ASCD
              </a>{' '}
              on topics including AI in education, prompt engineering for teachers, and ethical AI adoption.
              He speaks at conferences on how educators can leverage AI tools effectively and responsibly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Humanitarians AI</h2>
            <p>
              Bear founded{' '}
              <a href="https://github.com/nikbearbrown" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Humanitarians AI
              </a>
              , a 501(c)(3) nonprofit dedicated to developing ethical AI solutions for education, healthcare, and
              social impact. The organization mentors recent graduates through its Fellows Program, helping them
              build portfolios and transition into AI careers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Music &amp; Art</h2>
            <p>
              Beyond technology, Bear is a songwriter with music on{' '}
              <a href="https://open.spotify.com/artist/0hSpFCJodAYMP2cWK72zI6" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Spotify
              </a>{' '}
              and a digital artist exploring the intersection of AI and creative expression. His work spans
              traditional songwriting, AI-generated art, and collaborative projects with students and fellow artists.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Connect</h2>
            <p>
              Bear is open to consulting, collaboration, and speaking engagements. Reach out at{' '}
              <a href="mailto:bear@bearbrown.co" className="text-primary hover:underline">bear@bearbrown.co</a>.
            </p>
            <div className="flex flex-wrap gap-4 mt-4 not-prose">
              <a href="https://github.com/nikbearbrown" target="_blank" rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-black text-white shadow hover:bg-gray-800 dark:border dark:border-input dark:bg-background dark:text-foreground dark:shadow-sm dark:hover:bg-accent dark:hover:text-accent-foreground">
                GitHub
              </a>
              <a href="https://www.youtube.com/@NikBearBrown" target="_blank" rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-black text-white shadow hover:bg-gray-800 dark:border dark:border-input dark:bg-background dark:text-foreground dark:shadow-sm dark:hover:bg-accent dark:hover:text-accent-foreground">
                YouTube
              </a>
              <a href="https://open.spotify.com/artist/0hSpFCJodAYMP2cWK72zI6" target="_blank" rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-black text-white shadow hover:bg-gray-800 dark:border dark:border-input dark:bg-background dark:text-foreground dark:shadow-sm dark:hover:bg-accent dark:hover:text-accent-foreground">
                Spotify
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
