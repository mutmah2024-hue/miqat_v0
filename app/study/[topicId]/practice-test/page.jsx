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

export default function PracticeTestPage({
	params,
}) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const [topic, setTopic] = useState(null);
	const [material, setMaterial] = useState(null);

	const [practiceTest, setPracticeTest] =
		useState(null);

	const [currentIndex, setCurrentIndex] =
		useState(0);

	const [selectedAnswer, setSelectedAnswer] =
		useState(null);

	const [showResult, setShowResult] =
		useState(false);

	const [score, setScore] =
		useState(0);

	const [completed, setCompleted] =
		useState(false);

	const [error, setError] =
		useState("");

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
						} = await params;

						const searchParams =
							new URLSearchParams(
								window.location.search,
							);

						const materialId =
							searchParams.get(
								"materialId",
							);

						if (!materialId) {
							throw new Error(
								"Study material was not specified.",
							);
						}

						const loadedTopic =
							await getStudyTopic(
								currentUser.uid,
								topicId,
							);

						const materials =
							await getStudyMaterials(
								currentUser.uid,
								topicId,
							);

						const loadedMaterial =
							materials.find(
								(item) =>
									item.id ===
									materialId,
							);

						if (!loadedMaterial) {
							throw new Error(
								"Study material not found.",
							);
						}

						/*
							Support both the old Firestore
							structure:

							practiceTest: {
								practiceTest: {
									questions: [...]
								}
							}

							and the corrected structure:

							practiceTest: {
								questions: [...]
							}
						*/
						const loadedPracticeTest =
							loadedMaterial
								.practiceTest
								?.questions
								? loadedMaterial.practiceTest
								: loadedMaterial
										.practiceTest
										?.practiceTest;

						if (
							!loadedPracticeTest ||
							!loadedPracticeTest
								.questions
								?.length
						) {
							throw new Error(
								"The practice test for this material is not ready yet.",
							);
						}

						setTopic(
							loadedTopic,
						);

						setMaterial(
							loadedMaterial,
						);

						setPracticeTest(
							loadedPracticeTest,
						);
					} catch (error) {
						console.error(
							"Error loading Practice Test:",
							error,
						);

						setError(
							error.message ||
								"Unable to load the Practice Test.",
						);
					}
				},
			);

		return () => unsubscribe();
	}, [params]);

	const questions =
		practiceTest?.questions || [];

	const currentQuestion =
		questions[currentIndex];

	const totalQuestions =
		questions.length;

	const handleAnswerSelect = (
		answer,
	) => {
		if (
			selectedAnswer !== null ||
			!currentQuestion
		) {
			return;
		}

		setSelectedAnswer(answer);
		setShowResult(true);

		if (
			answer ===
			currentQuestion.correctAnswer
		) {
			setScore(
				(currentScore) =>
					currentScore + 1,
			);
		}
	};

	const handleNext = () => {
		if (
			currentIndex >=
			totalQuestions - 1
		) {
			setCompleted(true);
			return;
		}

		setCurrentIndex(
			(currentIndex) =>
				currentIndex + 1,
		);

		setSelectedAnswer(null);
		setShowResult(false);
	};

	const handlePrevious = () => {
		if (currentIndex === 0) {
			return;
		}

		setCurrentIndex(
			(currentIndex) =>
				currentIndex - 1,
		);

		setSelectedAnswer(null);
		setShowResult(false);
	};

	const restartTest = () => {
		setCurrentIndex(0);
		setSelectedAnswer(null);
		setShowResult(false);
		setScore(0);
		setCompleted(false);
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
									Practice Test
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

						{!error &&
							completed && (
								<section className="mt-10 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
									<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
										Test complete
									</p>

									<h2 className="mt-4 text-3xl font-semibold text-primary">
										{score} /{" "}
										{totalQuestions}
									</h2>

									<p className="mt-3 text-sm leading-7 text-muted">
										You completed the practice
										test for this material.
									</p>

									<button
										type="button"
										onClick={
											restartTest
										}
										className="mt-8 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
									>
										Retake Test
									</button>
								</section>
							)}

						{!error &&
							!completed &&
							currentQuestion && (
								<section className="mt-10">
									<div className="flex items-center justify-between gap-4">
										<div>
											<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
												Question
											</p>

											<p className="mt-2 text-sm font-medium text-primary">
												{currentIndex +
													1}{" "}
												/{" "}
												{totalQuestions}
											</p>
										</div>

										<p className="text-xs text-muted">
											Score:{" "}
											{score}
										</p>
									</div>

									<div className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
										<h2 className="break-words text-xl font-semibold leading-8 text-primary sm:text-2xl">
											{
												currentQuestion.question
											}
										</h2>

										<div className="mt-8 space-y-3">
											{currentQuestion.options?.map(
												(
													option,
													index,
												) => {
													const isSelected =
														selectedAnswer ===
														option;

													const isCorrect =
														option ===
														currentQuestion.correctAnswer;

													let optionClass =
														"border-border bg-surface hover:bg-elevated";

													if (
														showResult &&
														isCorrect
													) {
														optionClass =
															"border-primary bg-soft";
													} else if (
														showResult &&
														isSelected &&
														!isCorrect
													) {
														optionClass =
															"border-border bg-soft opacity-70";
													}

													return (
														<button
															key={`${option}-${index}`}
															type="button"
															onClick={() =>
																handleAnswerSelect(
																	option,
																)
															}
															disabled={
																showResult
															}
															className={`flex w-full min-w-0 items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-colors ${optionClass} disabled:cursor-default`}
														>
															<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-primary">
																{String.fromCharCode(
																	65 +
																		index,
																)}
															</span>

															<span className="min-w-0 break-words pt-1 text-sm leading-6 text-primary">
																{
																	option
																}
															</span>
														</button>
													);
												},
											)}
										</div>

										{showResult && (
											<div className="mt-6 rounded-2xl border border-border bg-soft p-5">
												<p className="text-sm font-semibold text-primary">
													{selectedAnswer ===
													currentQuestion.correctAnswer
														? "Correct"
														: "Incorrect"}
												</p>

												{selectedAnswer !==
													currentQuestion.correctAnswer && (
													<p className="mt-2 break-words text-sm leading-6 text-muted">
														Correct answer:{" "}
														<span className="font-medium text-primary">
															{
																currentQuestion.correctAnswer
															}
														</span>
													</p>
												)}

												{currentQuestion.explanation && (
													<p className="mt-3 break-words text-sm leading-6 text-muted">
														{
															currentQuestion.explanation
														}
													</p>
												)}
											</div>
										)}
									</div>

									<div className="mt-6 flex items-center justify-between gap-4">
										<button
											type="button"
											onClick={
												handlePrevious
											}
											disabled={
												currentIndex ===
												0
											}
											className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-lg text-primary transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30"
											aria-label="Previous question"
										>
											←
										</button>

										<p className="min-w-0 text-center text-xs text-muted sm:text-sm">
											{showResult
												? "Review your answer, then continue."
												: "Select an answer to continue."}
										</p>

										<button
											type="button"
											onClick={
												handleNext
											}
											disabled={
												!showResult
											}
											className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-lg text-primary transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30"
											aria-label={
												currentIndex ===
												totalQuestions -
													1
													? "Finish test"
													: "Next question"
											}
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