import SpotifyPlayer from '@/components/SpotifyPlayer/SpotifyPlayer'

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Business Card Section */}
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Nik Bear Brown
              </h1>
              <p className="max-w-[500px] text-lg text-muted-foreground">
                Educator, artist, musician, and AI innovator dedicated to advancing artificial intelligence for social good.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row pt-2">
                <a
                  href="/about"
                  className="inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-black text-white shadow hover:bg-gray-800 dark:border dark:border-input dark:bg-background dark:text-foreground dark:shadow-sm dark:hover:bg-accent dark:hover:text-accent-foreground"
                >
                  About Me
                </a>
                <a
                  href="mailto:bear@bearbrown.co"
                  className="inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-black text-white shadow hover:bg-gray-800 dark:border dark:border-input dark:bg-background dark:text-foreground dark:shadow-sm dark:hover:bg-accent dark:hover:text-accent-foreground"
                >
                  Contact
                </a>
              </div>
            </div>
            <div>
              <SpotifyPlayer />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
