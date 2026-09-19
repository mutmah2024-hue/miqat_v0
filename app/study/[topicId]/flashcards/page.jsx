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

export default function FlashcardsPage({
	params,
}) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const [topic, setTopic] = useState(null);
	const [material, setMaterial] = useState(null);

	const [flashcards, setFlashcards] =
		useState(null);

	const [currentIndex, setCurrentIndex] =
		useState(0);

	const [showAnswer, setShowAnswer] =
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
						return;
					}

					try {
						const { topicId } =
							await params;

						const searchParams =
							new URLSearchParams(
								window.location.search
							);

						const materialId =
							searchParams.get(
								"materialId"
							);

						if (!materialId) {
							throw new Error(
								"Study material was not specified."
							);
						}

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

						if (
							loadedMaterial.flashcards
						) {
							setFlashcards(
								loadedMaterial.flashcards
							);
						}
					} catch (error) {
						console.error(
							"Error loading Flashcards:",
							error
						);

						setError(
							error.message ||
								"Unable to load the Flashcards."
						);
					}
				}
			);

		return () => unsubscribe();
	}, [params]);

	const cards =
		flashcards?.flashcards || [];

	const currentCard =
		cards[currentIndex];

	const totalCards = cards.length;

	const goToPrevious = () => {
		if (currentIndex === 0) {
			return;
		}

		setCurrentIndex(
			(currentIndex) =>
				currentIndex - 1
		);

		setShowAnswer(false);
	};

	const goToNext = () => {
		if (
			currentIndex >=
			totalCards - 1
		) {
			return;
		}

		setCurrentIndex(
			(currentIndex) =>
				currentIndex + 1
		);

		setShowAnswer(false);
	};

	const handleCardClick = () => {
		setShowAnswer(
			(current) => !current
		);
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

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="flex min-h-screen">
				<Sidebar user={user} />

				<div className="min-w-0 flex-1">
					<div className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">

						<div className="flex items-start justify-between gap-6">
							<div className="min-w-0">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
									{topic?.name ||
										"Study"}
								</p>

								<h1 className="mt-3 break-words text-3xl font-semibold tracking-tight text-primary">
									Flashcards
								</h1>

								<p className="mt-2 break-words text-sm text-muted">
									{material?.name}
								</p>
							</div>

							<ThemeToggle />
						</div>

						{error && (
							<div className="mt-6 rounded-xl border border-border bg-soft px-4 py-3 text-sm text-primary">
								{error}
							</div>
						)}

						{totalCards === 0 && !error && (
							<section className="mt-10 rounded-2xl border border-border bg-surface p-6">
								<p className="text-sm text-muted">
									No Flashcards are
									available for this
									material yet.
								</p>
							</section>
						)}

						{currentCard && (
							<section className="mt-10">

								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
											Flashcard
										</p>

										<p className="mt-2 text-sm font-medium text-primary">
											{currentIndex +
												1}{" "}
											/{" "}
											{totalCards}
										</p>
									</div>

									<p className="text-xs text-muted">
										{showAnswer
											? "Answer"
											: "Question"}
									</p>
								</div>

								<button
									type="button"
									onClick={
										handleCardClick
									}
									className="mt-5 flex min-h-[360px] w-full flex-col items-center justify-center rounded-3xl border border-border bg-surface px-6 py-10 text-center shadow-sm transition-colors hover:bg-elevated sm:min-h-[400px] sm:px-12"
								>
									<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
										{showAnswer
											? "Answer"
											: "Question"}
									</p>

									<p className="mt-6 max-w-2xl break-words text-xl font-semibold leading-9 text-primary sm:text-2xl">
										{showAnswer
											? currentCard.answer
											: currentCard.question}
									</p>

									<p className="mt-8 text-xs text-muted">
										{showAnswer
											? "Click to see the question"
											: "Click to reveal the answer"}
									</p>
								</button>

								<div className="mt-6 flex items-center justify-between gap-4">

									<button
										type="button"
										onClick={
											goToPrevious
										}
										disabled={
											currentIndex ===
											0
										}
										aria-label="Previous flashcard"
										className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-lg text-primary transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30"
									>
										←
									</button>

									<p className="text-sm text-muted">
										{showAnswer
											? "Review the answer, then continue."
											: "Try to answer before revealing it."}
									</p>

									<button
										type="button"
										onClick={
											goToNext
										}
										disabled={
											currentIndex ===
											totalCards -
												1
										}
										aria-label="Next flashcard"
										className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-lg text-primary transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30"
									>
										→
									</button>

								</div>
							</section>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}