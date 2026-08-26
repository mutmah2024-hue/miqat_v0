"use client";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

export default function Qibla() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="flex min-h-screen">
				<Sidebar />

				<ThemeToggle />

				<div className="min-w-0 flex-1">
					<div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:py-14">
						<section>
							<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
								QIBLA
							</p>

							<h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
								Qibla
							</h1>

							<p className="mt-3 max-w-xl text-sm leading-7 text-muted">
								Qibla direction will be available here soon.
							</p>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}