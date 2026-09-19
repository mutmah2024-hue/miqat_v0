
"use client";

import Sidebar from "../../../components/Sidebar";
import ThemeToggle from "../../../components/ThemeToggle";

import {
	useEffect,
	useState,
} from "react";

import {
	onAuthStateChanged,
} from "firebase/auth";

import {
	auth,
} from "../../../../lib/firebase";

import {
	getStudyTopic,
	getStudyMaterials,
} from "../../../../lib/firestore";

export default function StudyMaterialPage({
	params,
}) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const [topic, setTopic] = useState(null);
	const [material, setMaterial] = useState(null);

	const [error, setError] = useState("");

	useEffect(() => {
		const unsubscribe =
			onAuthStateChanged(
				auth,
				async (currentUser) => {
					setUser(currentUser);
					setLoading(false);

					if (!currentUser) {
						return;
					}

					try {
						const {
							topicId,
							materialId,
						} = await params;

						const loadedTopic =
							await getStudyTopic(
								currentUser.uid,
								topicId
							);

						const materials =
							await getStudyMaterials(
								currentUser.uid,
								topicId
							);

						const loadedMaterial =
							materials.find(
								(item) =>
									item.id ===
									materialId
							);

						if (!loadedMaterial) {
							throw new Error(
								"Study material not found."
							);
						}

						setTopic(
							loadedTopic
						);

						setMaterial(
							loadedMaterial
						);
					} catch (error) {
						console.error(
							"Error loading study material:",
							error
						);

						setError(
							error.message ||
								"Unable to load this study material."
						);
					}
				}
			);

		return () => unsubscribe();
	}, [params]);

	const openStudyGuide = () => {
		if (!topic?.id || !material?.id) {
			return;
		}

		window.location.href =
			`/study/${topic.id}/study-guide?materialId=${material.id}`;
	};
const openFlashcards = () => {
	if (!topic?.id || !material?.id) {
		return;
	}

	window.location.href =
		`/study/${topic.id}/flashcards?materialId=${material.id}`;
};

const openPracticeTest = () => {
	if (!topic?.id || !material?.id) {
		return;
	}

	window.location.href =
		`/study/${topic.id}/practice-test?materialId=${material.id}`;
};

const openSmartStudy = () => {
	if (!topic?.id || !material?.id) {
		return;
	}

	window.location.href =
		`/study/${topic.id}/smart-study?materialId=${material.id}`;
};
	const handleOpenMaterial = async () => {
		if (!material?.filePath) {
			return;
		}

		try {
			setError("");

			const response =
				await fetch(
					"/api/study/material/url",
					{
						method: "POST",

						headers: {
							"Content-Type":
								"application/json",
						},

						body: JSON.stringify({
							filePath:
								material.filePath,
						}),
					}
				);

			const result =
				await response.json();

			if (!response.ok) {
				throw new Error(
					result.error ||
						"Unable to open the PDF."
				);
			}

			window.open(
				result.url,
				"_blank",
				"noopener,noreferrer"
			);
		} catch (error) {
			console.error(
				"Error opening study material:",
				error
			);

			setError(
				error.message ||
					"Unable to open the PDF."
			);
		}
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
						You need to sign in to access Wasl.
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

	if (error && !material) {
		return (
			<main className="min-h-screen bg-background text-foreground">
				<div className="flex min-h-screen">
					<Sidebar user={user} />

					<div className="min-w-0 flex-1">
						<div className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
							<p className="text-sm text-muted">
								{error}
							</p>

							<a
								href={`/study/${topic?.id || ""}`}
								className="mt-5 inline-flex rounded-xl border border-border px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-elevated"
							>
								Back to topic
							</a>
						</div>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="flex min-h-screen">
				<Sidebar user={user} />

				<div className="min-w-0 flex-1">
					<div className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">

						{/* Header */}

						<div className="flex items-start justify-between gap-6">
							<div className="min-w-0">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
									{topic?.name ||
										"Study"}
								</p>

								<h1 className="mt-3 break-words text-3xl font-semibold tracking-tight text-primary">
									{material?.name}
								</h1>

								<p className="mt-2 text-sm text-muted">
									Study this material
									with Wasl.
								</p>
							</div>

							<ThemeToggle />
						</div>

						{/* Error */}

						{error && (
							<div className="mt-6 rounded-xl border border-border bg-soft px-4 py-3 text-sm text-primary">
								{error}
							</div>
						)}

						{/* PDF */}

						<section className="mt-10 rounded-2xl border border-border bg-surface p-6">
							<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0">
									<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
										Material
									</p>

									<h2 className="mt-2 break-words text-base font-semibold text-primary">
										{material?.name}
									</h2>

									<p className="mt-1 text-sm text-muted">
										PDF
									</p>
								</div>

								<button
									type="button"
									onClick={
										handleOpenMaterial
									}
									className="shrink-0 rounded-xl border border-border px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-elevated"
								>
									Open PDF
								</button>
							</div>
						</section>

						{/* Study Modes */}

						<section className="mt-10">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
									Study Modes
								</p>

								<h2 className="mt-3 text-xl font-semibold text-primary">
									Choose how you want to study
								</h2>

								<p className="mt-2 max-w-xl text-sm leading-6 text-muted">
									Use this material in
									the way that works
									best for you.
								</p>
							</div>

							<div className="mt-6 grid gap-4 sm:grid-cols-2">

								{/* Study Guide */}

								<button
									type="button"
									onClick={
										openStudyGuide
									}
									className="group min-w-0 rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:bg-elevated"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<h3 className="text-base font-semibold text-primary">
												Study Guide
											</h3>

											<p className="mt-2 text-sm leading-6 text-muted">
												Understand the
												material with
												clear
												explanations,
												key concepts,
												and important
												points.
											</p>
										</div>

										<span className="shrink-0 text-lg text-primary">
											→
										</span>
									</div>
								</button>

								{/* Flashcards */}

								<button
                                    type="button"
                                    onClick={openFlashcards}
                                    className="group min-w-0 rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:bg-elevated"
                                    >
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<h3 className="text-base font-semibold text-primary">
												Flashcards
											</h3>

											<p className="mt-2 text-sm leading-6 text-muted">
												Review
												important
												facts and
												concepts
												through
												active
												recall.
											</p>
										</div>

										<span className="shrink-0 text-lg text-primary">
											→
										</span>
									</div>
								</button>

								{/* Practice Test */}

								<button
                                        type="button"
                                        onClick={openPracticeTest}
                                        className="group min-w-0 rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:bg-elevated"
                                    >
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<h3 className="text-base font-semibold text-primary">
												Practice Test
											</h3>

											<p className="mt-2 text-sm leading-6 text-muted">
												Test your
												understanding
												with
												questions
												based on
												this
												material.
											</p>
										</div>

										<span className="shrink-0 text-lg text-primary">
											→
										</span>
									</div>
								</button>


							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}
