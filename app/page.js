export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      
      <header className="border-b border-border">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <a
            href="/"
            className="text-sm font-medium tracking-[0.35em] text-primary"
          >
            MĪQĀT
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              About
            </a>

            <a
              href="/signinup"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Sign in
            </a>

            <a
              href="/signinup"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get started
            </a>
          </div>

          <a
            href="/signinup"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-background md:hidden"
          >
            Get started
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative">
        <div
          className="pointer-events-none absolute -left-32 top-20 select-none font-serif text-[24rem] leading-none text-primary opacity-[0.025]"
          aria-hidden="true"
        >
          م
        </div>

        <div
          className="pointer-events-none absolute -bottom-32 right-[-8rem] select-none font-serif text-[28rem] leading-none text-primary opacity-[0.025]"
          aria-hidden="true"
        >
          ق
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-28">
          {/* Hero copy */}
          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
              Prayer · Qur'an · Focus · Reflection
            </p>

            <h1 className="mt-7 text-5xl font-semibold leading-[1.05] tracking-tight text-primary sm:text-6xl lg:text-7xl">
              A more intentional way to{" "}
              <span className="text-primary">spend your day.</span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-muted sm:text-lg">
              Mīqāt brings prayer, Qur'an, focus, and reflection together in
              one calm space, helping you make better use of your time and
              attention.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="/signinup"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-7 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Begin your journey
              </a>

              <a
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-7 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                Explore Mīqāt
              </a>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative z-10">
            <div className="rounded-[2rem] border border-border bg-surface p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[1.5rem] border border-border bg-background">
                {/* Preview header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-5">
                  <div>
                    <p className="text-xs text-muted">Tuesday, 25 August</p>
                    <h2 className="mt-1 text-lg font-medium">
                      Good morning.
                    </h2>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-sm text-primary">
                    M
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {/* Prayer card */}
                  <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted">NEXT PRAYER</p>
                        <h3 className="mt-2 text-2xl font-medium">
                          Dhuhr
                        </h3>
                      </div>

                      <span className="rounded-full bg-soft px-3 py-1 text-xs text-primary">
                        01:24:36
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm">
                      <span className="text-muted">Prayer time</span>
                      <span className="text-foreground">12:58 PM</span>
                    </div>
                  </div>

                  {/* Two small cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border bg-surface p-5">
                      <p className="text-xs text-muted">QUR'AN</p>
                      <p className="mt-3 text-2xl font-medium">12</p>
                      <p className="mt-1 text-xs text-muted">
                        day streak
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-5">
                      <p className="text-xs text-muted">FOCUS</p>
                      <p className="mt-3 text-2xl font-medium">01:24</p>
                      <p className="mt-1 text-xs text-muted">
                        today
                      </p>
                    </div>
                  </div>

                  {/* Reflection */}
                  <div className="rounded-2xl border border-border bg-surface p-5">
                    <p className="text-xs text-muted">
                      TODAY'S REFLECTION
                    </p>

                    <div className="mt-4 h-2 w-20 rounded-full bg-soft" />
                    <div className="mt-2 h-2 w-32 rounded-full bg-soft opacity-60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            <div
              className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-primary opacity-[0.025] blur-3xl"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-border bg-surface"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-[0.25em] text-primary">
              ONE CALM SPACE
            </p>

            <h2 className="mt-5 text-4xl font-semibold text-primary tracking-tight sm:text-5xl">
              Everything you need to stay intentional.
            </h2>

            <p className="mt-6 text-base leading-8 text-muted">
              Mīqāt is designed around the parts of your day that deserve
              more attention, not more distraction.
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2">
            <Feature
              number="01"
              title="Prayer"
              description="Stay connected to your five daily prayers with prayer times, reminders, and Qibla."
            />

            <Feature
              number="02"
              title="Qur'an"
              description="Build a consistent relationship with the Qur'an through reading, memorization, and progress."
            />

            <Feature
              number="03"
              title="Focus"
              description="Create space for meaningful work and protect your attention from constant distraction."
            />

            <Feature
              number="04"
              title="Reflection"
              description="Pause, reflect, and keep track of the small things that help you grow."
            />
          </div>
        </div>
      </section>

      {/* Dashboard section */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
          <div className="order-2 lg:order-1">
            <div className="rounded-3xl border border-border bg-surface p-3">
              <div className="rounded-2xl border border-border bg-background p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted">YOUR DAY</p>
                    <h3 className="mt-2 text-xl text-primary font-medium">
                      Tuesday
                    </h3>
                  </div>

                  <div className="rounded-full bg-soft px-3 py-1 text-xs text-primary">
                    68% complete
                  </div>
                </div>

                <div className="mt-8 h-2 overflow-hidden rounded-full bg-soft">
                  <div className="h-full w-[68%] rounded-full bg-primary" />
                </div>

                <div className="mt-8 space-y-3">
                  <DashboardItem
                    title="Fajr"
                    detail="Prayer"
                    completed
                  />

                  <DashboardItem
                    title="Qur'an reading"
                    detail="20 minutes"
                    completed
                  />

                  <DashboardItem
                    title="Focus session"
                    detail="45 minutes"
                    completed
                  />

                  <DashboardItem
                    title="Dhuhr"
                    detail="Prayer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 max-w-xl lg:order-2">
            <p className="text-sm font-medium tracking-[0.25em] text-primary">
              YOUR DAY, GATHERED
            </p>

            <h2 className="mt-5 text-4xl font-semibold text-primary tracking-tight sm:text-5xl">
              Less noise. More intention.
            </h2>

            <p className="mt-6 text-base leading-8 text-muted">
              Instead of jumping between different apps and reminders,
              Mīqāt gives you one place to see what matters today.
            </p>

            <div className="mt-8 space-y-5">
              <Point
                title="See your priorities"
                description="Keep worship, focus, and reflection visible throughout your day."
              />

              <Point
                title="Build consistency"
                description="Track progress without turning your spiritual life into a competition."
              />

              <Point
                title="Use your phone intentionally"
                description="Let your device become a tool for what matters instead of another source of distraction."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section
        id="about"
        className="border-t border-border bg-surface"
      >
        <div className="mx-auto max-w-4xl px-6 py-28 text-center lg:py-36">
          <p className="text-sm font-medium tracking-[0.25em] text-primary">
            WHY MĪQĀT
          </p>

          <h2 className="mt-6 text-4xl font-semibold leading-tight text-primary tracking-tight sm:text-5xl lg:text-6xl">
            Your phone should serve your life, not consume it.
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Mīqāt is built around a simple idea: technology can either pull
            your attention in a hundred directions or help you live with
            intention. We choose the second.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-28 text-center lg:py-36">
          <p className="text-sm font-medium tracking-[0.25em] text-primary">
            YOUR TIME MATTERS
          </p>

          <h2 className="mt-5 text-4xl font-semibold text-primary tracking-tight sm:text-5xl">
            Make room for what matters.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
            Start building a more intentional relationship with your time,
            worship, and attention.
          </p>

          <a
            href="/signup"
            className="mt-9 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Create your account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p className="tracking-[0.25em] text-primary">MĪQĀT</p>

          <p>A calm space for prayer, Qur'an, focus and reflection.</p>
        </div>
      </footer>
    </main>
  );
}

function Feature({ number, title, description }) {
  return (
    <article className="bg-background p-7 sm:p-9">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-[0.2em] text-muted">
          {number}
        </span>

        <span className="h-2 w-2 rounded-full bg-primary" />
      </div>

      <h3 className="mt-12 text-xl font-medium">{title}</h3>

      <p className="mt-3 max-w-sm text-sm leading-7 text-muted">
        {description}
      </p>
    </article>
  );
}

function DashboardItem({ title, detail, completed = false }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted">{detail}</p>
      </div>

      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full border ${
          completed
            ? "border-primary bg-soft text-primary"
            : "border-border text-muted"
        }`}
      >
        {completed ? "✓" : ""}
      </div>
    </div>
  );
}

function Point({ title, description }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-soft text-xs text-primary">
        ✓
      </div>

      <div>
        <h3 className="text-sm font-medium">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}