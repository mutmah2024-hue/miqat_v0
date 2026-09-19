"use client";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import CreateTopic from "./components/CreateTopic";

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

import {
	getStudyTopics,
	createStudyTopic,
} from "../../lib/firestore";

export default function Study() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const [topics, setTopics] = useState([]);
	const [topicsLoading, setTopicsLoading] =
		useState(false);

	const [showCreateTopic, setShowCreateTopic] =
		useState(false);

	const [error, setError] = useState("");

	useEffect(() => {
		const unsubscribe =
			onAuthStateChanged(
				auth,
				async (currentUser) => {
					setUser(currentUser);
					setLoading(false);

					if (!currentUser) {
						setTopics([]);
						return;
					}

					await loadTopics(
						currentUser.uid
					);
				}
			);

		return () => unsubscribe();
	}, []);

	const loadTopics = async (userId) => {
		try {
			setTopicsLoading(true);
			setError("");

			const loadedTopics =
				await getStudyTopics(
					userId
				);

			setTopics(loadedTopics);
		} catch (error) {
			console.error(
				"Error loading study topics:",
				error
			);

			setError(
				"Unable to load your study topics."
			);
		} finally {
			setTopicsLoading(false);
		}
	};

	const handleCreateTopic = async (
		topic
	) => {
		if (!user) {
			return;
		}

		try {
			setError("");

			const newTopic =
				await createStudyTopic(
					user.uid,
					topic.name
				);

			setTopics(
				(currentTopics) => [
					newTopic,
					...currentTopics,
				]
			);

			setShowCreateTopic(false);
		} catch (error) {
			console.error(
				"Error creating study topic:",
				error
			);

			setError(
				"Unable to create this topic. Please try again."
			);
		}
	};

	const openTopic = (topicId) => {
		window.location.href =
			`/study/${topicId}`;
	};

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
					<div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">

						<div className="flex items-start justify-between gap-6">
							<div>
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
									Study
								</p>

								<h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
									Your study space
								</h1>

								<p className="mt-2 max-w-xl text-sm leading-6 text-muted">
									Learn, understand, recall, and test yourself
									with your own study materials.
								</p>
							</div>

							<ThemeToggle />
						</div>

						<section className="mt-10">
							<button
								type="button"
								onClick={() =>
									setShowCreateTopic(
										true
									)
								}
								className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
							>
								<span className="mr-2 text-lg leading-none">
									+
								</span>

								New Topic
							</button>
						</section>

						{error && (
							<div className="mt-5 rounded-xl border border-border bg-soft px-4 py-3 text-sm text-primary">
								{error}
							</div>
						)}

						<section className="mt-12">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
								Your Topics
							</h2>

							{topicsLoading ? (
								<div className="mt-4 rounded-2xl border border-border bg-surface px-6 py-12 text-center">
									<div className="mx-auto h-6 w-6 animate-spin rounded-full border-3 border-soft border-t-primary" />

									<p className="mt-4 text-sm text-muted">
										Loading your topics...
									</p>
								</div>
							) : topics.length === 0 ? (
								<div className="mt-4 rounded-2xl border border-border bg-surface px-6 py-12 text-center">
									<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-soft text-xl text-primary">
										+
									</div>

									<h3 className="mt-5 text-base font-medium text-primary">
										No topics yet
									</h3>

									<p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
										Create a topic to keep your study
										materials and learning tools together.
									</p>

									<button
										type="button"
										onClick={() =>
											setShowCreateTopic(
												true
											)
										}
										className="mt-6 rounded-xl border border-border px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-elevated"
									>
										Create your first topic
									</button>
								</div>
							) : (
								<div className="mt-4 grid gap-4 sm:grid-cols-2">
									{topics.map(
										(topic) => (
											<button
												key={
													topic.id
												}
												type="button"
												onClick={() =>
													openTopic(
														topic.id
													)
												}
												className="rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:bg-elevated"
											>
												<h3 className="text-base font-semibold text-primary">
													{
														topic.name
													}
												</h3>

												<p className="mt-2 text-sm text-muted">
													No materials yet
												</p>

												<p className="mt-5 text-sm font-medium text-primary">
													Open topic →
												</p>
											</button>
										)
									)}
								</div>
							)}
						</section>

					</div>
				</div>
			</div>

			{showCreateTopic && (
				<CreateTopic
					onClose={() =>
						setShowCreateTopic(
							false
						)
					}
					onCreate={
						handleCreateTopic
					}
				/>
			)}
		</main>
	);
}