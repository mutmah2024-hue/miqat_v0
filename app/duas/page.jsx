"use client";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

import {
	useEffect,
	useState,
} from "react";

import {
	onAuthStateChanged,
} from "firebase/auth";

import {
	auth,
} from "../../lib/firebase";

import generalAdhkarData from "../../data/generaladhkar.json";

const fixedCollections = [
	{
		id: "morning",
		title: "Morning Adhkār",
		description:
			"Begin your day with remembrance of Allah and the morning adhkār.",
	},
	{
		id: "evening",
		title: "Evening Adhkār",
		description:
			"End your day with remembrance, protection, and gratitude.",
	},
];

export default function DuasPage() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe =
			onAuthStateChanged(
				auth,
				(currentUser) => {
					setUser(currentUser);
					setLoading(false);
				},
			);

		return () => unsubscribe();
	}, []);

	const chapterCollections =
		generalAdhkarData.chapters.map(
			(chapter) => ({
				id: chapter.id,
				title: chapter.title,
				description:
					`${chapter.entryCount} ${
						chapter.entryCount === 1
							? "invocation"
							: "invocations"
					} in this collection.`,
			}),
		);

	const duaCollections = [
		...fixedCollections,
		...chapterCollections,
	];

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-soft border-t-primary" />

					<p className="text-sm text-muted">
						Loading...
					</p>
				</div>
			</main>
		);
	}

	if (!user) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-background px-6">
				<div className="text-center">
					<p className="text-sm text-muted">
						You need to sign in to access Mīqāt.
					</p>

					<a
						href="/Signinup"
						className="mt-5 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
					>
						Sign in
					</a>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="flex min-h-screen">
				<Sidebar user={user} />

				<div className="min-w-0 flex-1">
					<div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
						<div className="flex items-start justify-between gap-6">
							<div className="min-w-0">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
									Remembrance
								</p>

								<h1 className="mt-3 break-words text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
									Adhkār & Duʿā
								</h1>

								<p className="mt-3 max-w-2xl break-words text-sm leading-7 text-muted sm:text-base">
									Find the adhkār and supplications
									for different moments throughout
									your day.
								</p>
							</div>

							<ThemeToggle />
						</div>

						<section className="mt-10">
							<div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{duaCollections.map(
									(collection) => (
										<article
											key={
												collection.id
											}
											className="group flex min-w-0 flex-col rounded-3xl border border-border bg-surface p-6 transition-colors hover:bg-elevated"
										>
											<div className="flex min-h-[180px] flex-1 flex-col">
												<div className="flex items-start justify-between gap-4">
													<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft text-sm font-semibold text-primary">
														ذ
													</div>

													<span className="text-xs text-muted">
														Adhkār
													</span>
												</div>

												<h2 className="mt-7 break-words text-xl font-semibold text-primary">
													{
														collection.title
													}
												</h2>

												<p className="mt-3 break-words text-sm leading-6 text-muted">
													{
														collection.description
													}
												</p>
											</div>

											<a
												href={`/duas/${collection.id}`}
												className="mt-7 inline-flex items-center justify-between border-t border-border pt-4 text-sm font-medium text-primary transition-opacity group-hover:opacity-70"
											>
												<span>
													Read more
												</span>

												<span
													aria-hidden="true"
													className="text-base"
												>
													→
												</span>
											</a>
										</article>
									),
								)}
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}