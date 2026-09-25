"use client";

import Sidebar from "../../../components/Sidebar";
import ThemeToggle from "../../../components/ThemeToggle";

import { useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../../../lib/firebase";

import {
	getStudyTopic,
	getStudyMaterials,
} from "../../../../lib/firestore";

export default function StudyGuidePage({ params }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const [topic, setTopic] = useState(null);
	const [material, setMaterial] = useState(null);

	const [studyGuide, setStudyGuide] = useState(null);

	const [error, setError] = useState("");

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(
			auth,
			async (currentUser) => {
				setUser(currentUser);
				setLoading(false);

				if (!currentUser) {
					return;
				}

				try {
					const { topicId } = await params;

					const searchParams = new URLSearchParams(
						window.location.search
					);

					const materialId =
						searchParams.get("materialId");

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
								item.id === materialId
						);

					if (!loadedMaterial) {
						throw new Error(
							"Study material not found."
						);
					}

					setTopic(loadedTopic);
					setMaterial(loadedMaterial);

					if (loadedMaterial.studyGuide) {
						setStudyGuide(
							loadedMaterial.studyGuide
						);
					} else {
						setError(
							"Study Guide for this material is not ready yet."
						);
					}
				} catch (error) {
					console.error(
						"Error loading Study Guide:",
						error
					);

					setError(
						error.message ||
							"Unable to load the Study Guide."
					);
				}
			}
		);

		return () => unsubscribe();
	}, [params]);

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
					<div className="mx-auto w-full min-w-0 max-w-4xl px-4 pb-28 pt-10 sm:px-6 lg:px-10 lg:py-14">
						{/* Header */}

						<div className="flex items-start justify-between gap-6">
							<div className="min-w-0">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
									{topic?.name || "Study"}
								</p>

								<h1 className="mt-3 break-words text-3xl font-semibold tracking-tight text-primary">
									Study Guide
								</h1>

								<p className="mt-2 break-words text-sm text-muted">
									{material?.name}
								</p>
							</div>

							<ThemeToggle />
						</div>

						{/* Error */}

						{error && !studyGuide && (
							<div className="mt-6 rounded-xl border border-border bg-soft px-4 py-3 text-sm text-primary">
								{error}
							</div>
						)}

						{/* Study Guide */}

						{studyGuide && (
							<section className="mt-10">
								<div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
									<h2 className="text-2xl font-semibold text-primary">
										{studyGuide.title}
									</h2>

									{studyGuide.overview && (
										<p className="mt-4 text-sm leading-7 text-muted">
											{
												studyGuide.overview
											}
										</p>
									)}

									{/* Key Concepts */}

									{studyGuide.keyConcepts
										?.length > 0 && (
										<div className="mt-8">
											<h3 className="text-lg font-semibold text-primary">
												Key Concepts
											</h3>

											<div className="mt-4 space-y-4">
												{studyGuide.keyConcepts.map(
													(
														concept,
														index
													) => (
														<div
															key={
																index
															}
															className="rounded-xl border border-border p-4"
														>
															<h4 className="font-medium text-primary">
																{
																	concept.title
																}
															</h4>

															<p className="mt-2 text-sm leading-6 text-muted">
																{
																	concept.explanation
																}
															</p>
														</div>
													)
												)}
											</div>
										</div>
									)}

									{/* Sections */}

									{studyGuide.sections
										?.length > 0 && (
										<div className="mt-8">
											<h3 className="text-lg font-semibold text-primary">
												Sections
											</h3>

											<div className="mt-4 space-y-6">
												{studyGuide.sections.map(
													(
														section,
														index
													) => (
														<div
															key={
																index
															}
														>
															<h4 className="font-medium text-primary">
																{
																	section.title
																}
															</h4>

															<p className="mt-2 text-sm leading-6 text-muted">
																{
																	section.summary
																}
															</p>

															{section
																.importantPoints
																?.length >
																0 && (
																<ul className="mt-3 space-y-2">
																	{section.importantPoints.map(
																		(
																			point,
																			pointIndex
																		) => (
																			<li
																				key={
																					pointIndex
																				}
																				className="text-sm leading-6 text-muted"
																			>
																				<span className="mr-2 text-primary">
																					•
																				</span>

																				{
																					point
																				}
																			</li>
																		)
																	)}
																</ul>
															)}
														</div>
													)
												)}
											</div>
										</div>
									)}

									{/* Exam Focus */}

									{studyGuide.examFocus
										?.length > 0 && (
										<div className="mt-8">
											<h3 className="text-lg font-semibold text-primary">
												Exam Focus
											</h3>

											<ul className="mt-4 space-y-2">
												{studyGuide.examFocus.map(
													(
														point,
														index
													) => (
														<li
															key={
																index
															}
															className="text-sm leading-6 text-muted"
														>
															<span className="mr-2 text-primary">
																•
															</span>

															{
																point
															}
														</li>
													)
												)}
											</ul>
										</div>
									)}
								</div>
							</section>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}

