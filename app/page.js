import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
	return (
		<main className="min-h-screen overflow-hidden bg-background text-foreground">
			{/* Header */}
			<header className="border-b border-border bg-surface">
				<nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
					<a
						href="/"
						className="text-sm font-medium tracking-[0.35em] text-primary"
					>
						Mīqāt
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

					<div className="flex items-center gap-3">
						<ThemeToggle />

						<a
							href="/signinup"
							className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-background md:hidden"
						>
							Get started
						</a>
					</div>
				</nav>
			</header>

			{/* Hero */}
			<section className="relative">
				<div
					className="pointer-events-none absolute -left-32 top-16 select-none font-serif text-[24rem] leading-none text-primary opacity-[0.025]"
					aria-hidden="true"
				>
					و
				</div>

				<div
					className="pointer-events-none absolute -bottom-40 right-[-8rem] select-none font-serif text-[28rem] leading-none text-primary opacity-[0.025]"
					aria-hidden="true"
				>
					ق
				</div>

				<div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-28">
					<div className="relative z-10 max-w-xl">
						<p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
							Prayer · Qur'an · Study · Focus · Reflection
						</p>

						<h1 className="mt-7 text-5xl font-semibold leading-[1.05] tracking-tight text-primary sm:text-6xl lg:text-7xl">
							Live your day with{" "}
							<span className="text-primary">
								intention.
							</span>
						</h1>

						<p className="mt-7 max-w-lg text-base leading-8 text-muted sm:text-lg">
							Mīqāt brings worship, learning, focus,
							and reflection together in one calm
							space, helping you use your time and
							attention for what matters.
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

					{/* Product Preview */}
					<div className="relative z-10">
						<div className="rounded-[2rem] border border-border bg-surface p-3 shadow-2xl">
							<div className="overflow-hidden rounded-[1.5rem] border border-border bg-background">
								<div className="flex items-center justify-between border-b border-border px-6 py-5">
									<div>
										<p className="text-xs text-muted">
											Today
										</p>

										<h2 className="mt-1 text-lg font-medium">
											Good morning.
										</h2>
									</div>

									<div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-sm text-primary">
										M
									</div>
								</div>

								<div className="space-y-4 p-5">
									{/* Prayer */}
									<div className="rounded-2xl border border-border bg-surface p-5">
										<div className="flex items-start justify-between">
											<div>
												<p className="text-xs text-muted">
													NEXT PRAYER
												</p>

												<h3 className="mt-2 text-2xl font-medium">
													Dhuhr
												</h3>
											</div>

											<span className="rounded-full bg-soft px-3 py-1 text-xs text-primary">
												01:24:36
											</span>
										</div>

										<div className="mt-5 flex items-center justify-between text-sm">
											<span className="text-muted">
												Prayer time
											</span>

											<span className="text-foreground">
												12:58 PM
											</span>
										</div>
									</div>

									{/* Quick overview */}
									<div className="grid grid-cols-2 gap-4">
										<PreviewCard
											label="QUR'AN"
											value="12"
											detail="day streak"
										/>

										<PreviewCard
											label="FOCUS"
											value="01:24"
											detail="today"
										/>

										<PreviewCard
											label="STUDY"
											value="03"
											detail="topics"
										/>

										<PreviewCard
											label="TASBIH"
											value="120"
											detail="today"
										/>
									</div>

									{/* Reflection */}
									<div className="rounded-2xl border border-border bg-surface p-5">
										<div className="flex items-center justify-between">
											<p className="text-xs text-muted">
												TODAY'S REFLECTION
											</p>

											<span className="text-xs text-primary">
												Open
											</span>
										</div>

										<div className="mt-4 space-y-2">
											<div className="h-2 w-24 rounded-full bg-soft" />
											<div className="h-2 w-40 rounded-full bg-soft opacity-60" />
											<div className="h-2 w-32 rounded-full bg-soft opacity-40" />
										</div>
									</div>
								</div>
							</div>
						</div>

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

						<h2 className="mt-5 text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
							The things that deserve your attention.
						</h2>

						<p className="mt-6 text-base leading-8 text-muted">
							Mīqāt brings the spiritual, personal,
							and practical parts of your day into
							one place without turning them into noise.
						</p>
					</div>

					<div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
						<Feature
							number="01"
							title="Prayer"
							description="Stay connected to your five daily prayers with accurate prayer times, reminders, and Qibla."
						/>

						<Feature
							number="02"
							title="Qur'an"
							description="Build consistency through reading, memorization, revision, and meaningful progress."
						/>

						<Feature
							number="03"
							title="Study"
							description="Turn your study materials into guides, summaries, flashcards, practice tests, and smarter revision."
						/>

						<Feature
							number="04"
							title="Focus"
							description="Create protected space for deep work and use your attention deliberately."
						/>

						<Feature
							number="05"
							title="Tasbih"
							description="Keep your dhikr close with a simple counter built around your daily remembrance."
						/>

						<Feature
							number="06"
							title="Duas"
							description="Keep useful duas and daily supplications within easy reach when you need them."
						/>

						<Feature
							number="07"
							title="Reflection"
							description="Pause, write, notice patterns, and make space to think about how your days are going."
						/>

						<Feature
							number="08"
							title="Daily Life"
							description="Bring worship, learning, focus, and reflection together instead of managing them across disconnected apps."
						/>
					</div>
				</div>
			</section>

			{/* Study Spotlight */}
			<section className="border-t border-border">
				<div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
					<div className="order-2 lg:order-1">
						<div className="rounded-3xl border border-border bg-surface p-3">
							<div className="rounded-2xl border border-border bg-background p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs text-muted">
											STUDY
										</p>

										<h3 className="mt-2 text-xl font-medium text-primary">
											Biology
										</h3>
									</div>

									<span className="rounded-full bg-soft px-3 py-1 text-xs text-primary">
										Ready
									</span>
								</div>

								<div className="mt-7 rounded-2xl border border-border bg-surface p-5">
									<p className="text-sm font-medium">
										Characteristics of Living Organisms
									</p>

									<p className="mt-2 text-xs leading-6 text-muted">
										AI generated study materials
										from your uploaded PDF.
									</p>
								</div>

								<div className="mt-4 grid grid-cols-2 gap-3">
									<StudyMode
										title="Study Guide"
									/>

									<StudyMode
										title="Summary"
									/>

									<StudyMode
										title="Flashcards"
									/>

									<StudyMode
										title="Practice Test"
									/>
								</div>

								<div className="mt-3 rounded-xl border border-border bg-surface px-4 py-3">
									<p className="text-xs text-muted">
										Smart Study
									</p>

									<p className="mt-1 text-sm text-primary">
										Adaptive questions based on what you know.
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="order-1 max-w-xl lg:order-2">
						<p className="text-sm font-medium tracking-[0.25em] text-primary">
							LEARN WITH Mīqāt
						</p>

						<h2 className="mt-5 text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
							Your materials do more than sit in a folder.
						</h2>

						<p className="mt-6 text-base leading-8 text-muted">
							Upload your study material and let Mīqāt
							turn it into structured learning tools
							you can actually use.
						</p>

						<div className="mt-8 space-y-5">
							<Point
								title="Upload once"
								description="Add your PDF to a topic and keep your materials organized."
							/>

							<Point
								title="Understand"
								description="Turn the material into clear, structured explanations and summaries."
							/>

							<Point
								title="Recall"
								description="Use generated flashcards and active recall to strengthen memory."
							/>

							<Point
								title="Test"
								description="Practice with questions built from the material you uploaded."
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Daily Life */}
			<section className="border-t border-border bg-surface">
				<div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
					<div className="max-w-xl">
						<p className="text-sm font-medium tracking-[0.25em] text-primary">
							YOUR DAY, GATHERED
						</p>

						<h2 className="mt-5 text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
							One place for what matters.
						</h2>

						<p className="mt-6 text-base leading-8 text-muted">
							Instead of moving between separate apps
							for worship, studying, productivity,
							and reflection, Mīqāt brings those parts
							of your life together.
						</p>

						<div className="mt-8 space-y-5">
							<Point
								title="Stay connected"
								description="Keep prayer, Qur'an, and duas close throughout the day."
							/>

							<Point
								title="Keep learning"
								description="Move from uploaded material to active recall and practice."
							/>

							<Point
								title="Protect your attention"
								description="Use Focus to create space for work that actually matters."
							/>

							<Point
								title="Reflect"
								description="End the day with a little more awareness of how you spent it."
							/>
						</div>
					</div>

					<div>
						<div className="rounded-3xl border border-border bg-background p-3">
							<div className="rounded-2xl border border-border bg-surface p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs text-muted">
											YOUR DAY
										</p>

										<h3 className="mt-2 text-xl font-medium text-primary">
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
										title="Study session"
										detail="45 minutes"
										completed
									/>

									<DashboardItem
										title="Focus session"
										detail="30 minutes"
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
				</div>
			</section>

			{/* Philosophy */}
			<section
				id="about"
				className="border-t border-border"
			>
				<div className="mx-auto max-w-4xl px-6 py-28 text-center lg:py-36">
					<p className="text-sm font-medium tracking-[0.25em] text-primary">
						WHY Mīqāt
					</p>

					<h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-primary sm:text-5xl lg:text-6xl">
						Your phone should serve your life, not consume it.
					</h2>

					<p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-muted sm:text-lg">
						Mīqāt is built around a simple idea:
						technology can either scatter your
						attention or help you live more deliberately.
						We want it to be the second.
					</p>
				</div>
			</section>

			{/* Final CTA */}
			<section className="border-t border-border bg-surface">
				<div className="mx-auto max-w-4xl px-6 py-28 text-center lg:py-36">
					<p className="text-sm font-medium tracking-[0.25em] text-primary">
						YOUR TIME MATTERS
					</p>

					<h2 className="mt-5 text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
						Make room for what matters.
					</h2>

					<p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
						Build a more intentional relationship with
						your worship, learning, attention, and time.
					</p>

					<a
						href="/signinup"
						className="mt-9 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-background transition-opacity hover:opacity-90"
					>
						Create your account
					</a>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between lg:px-10">
					<p className="tracking-[0.25em] text-primary">
						Mīqāt
					</p>

					<p>
						A calm space for worship, learning,
						focus, and reflection.
					</p>

					<p>
						© 2026 Mīqāt. All rights reserved.
					</p>
				</div>
			</footer>
		</main>
	);
}

function Feature({
	number,
	title,
	description,
}) {
	return (
		<article className="bg-background p-7 sm:p-9">
			<div className="flex items-center justify-between">
				<span className="text-xs tracking-[0.2em] text-muted">
					{number}
				</span>

				<span className="h-2 w-2 rounded-full bg-primary" />
			</div>

			<h3 className="mt-12 text-xl font-medium text-primary">
				{title}
			</h3>

			<p className="mt-3 max-w-sm text-sm leading-7 text-muted">
				{description}
			</p>
		</article>
	);
}

function PreviewCard({
	label,
	value,
	detail,
}) {
	return (
		<div className="rounded-2xl border border-border bg-surface p-5">
			<p className="text-xs text-muted">
				{label}
			</p>

			<p className="mt-3 text-2xl font-medium text-primary">
				{value}
			</p>

			<p className="mt-1 text-xs text-muted">
				{detail}
			</p>
		</div>
	);
}

function StudyMode({ title }) {
	return (
		<div className="rounded-xl border border-border bg-background px-4 py-4">
			<p className="text-sm font-medium text-primary">
				{title}
			</p>
		</div>
	);
}

function DashboardItem({
	title,
	detail,
	completed = false,
}) {
	return (
		<div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-4">
			<div>
				<p className="text-sm font-medium">
					{title}
				</p>

				<p className="mt-1 text-xs text-muted">
					{detail}
				</p>
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

function Point({
	title,
	description,
}) {
	return (
		<div className="flex gap-4">
			<div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-soft text-xs text-primary">
				✓
			</div>

			<div>
				<h3 className="text-sm font-medium text-primary">
					{title}
				</h3>

				<p className="mt-1 text-sm leading-6 text-muted">
					{description}
				</p>
			</div>
		</div>
	);
}