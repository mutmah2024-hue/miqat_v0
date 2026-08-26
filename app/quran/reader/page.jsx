"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

import {
	getQuranPage,
	getQuranSurah,
} from "../../../lib/alquran";

import {
	saveLastQuranPage,
} from "../../../lib/firestore";

import { auth } from "../../../lib/firebase";

function QuranReaderContent() {
	const searchParams = useSearchParams();

	const [user, setUser] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [page, setPage] = useState(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [fontSize, setFontSize] = useState(28);

	const [touchStartX, setTouchStartX] = useState(null);
	const [touchStartY, setTouchStartY] = useState(null);

	/*
	 * Authentication
	 */

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(
			auth,
			(currentUser) => {
				setUser(currentUser);
			}
		);

		return () => unsubscribe();
	}, []);

	/*
	 * Determine which page to open
	 */

	useEffect(() => {
		async function determinePage() {
			const pageParam = Number(
				searchParams.get("page")
			);

			const surahParam = Number(
				searchParams.get("surah")
			);

			if (
				pageParam >= 1 &&
				pageParam <= 604
			) {
				setPageNumber(pageParam);
				return;
			}

			if (
				surahParam >= 1 &&
				surahParam <= 114
			) {
				try {
					const surah =
						await getQuranSurah(
							surahParam
						);

					const firstAyah =
						surah.ayahs?.[0];

					if (firstAyah?.page) {
						setPageNumber(
							firstAyah.page
						);

						return;
					}
				} catch (error) {
					console.error(
						"Could not find Surah page:",
						error
					);

					setError(
						"Unable to open Surah."
					);

					return;
				}
			}

			setPageNumber(1);
		}

		determinePage();
	}, [searchParams]);

	/*
	 * Load Qur'an page
	 */

	useEffect(() => {
		async function loadPage() {
			setLoading(true);
			setError("");

			try {
				const data =
					await getQuranPage(
						pageNumber
					);

				setPage(data);

				if (user) {
					await saveLastQuranPage(
						user.uid,
						pageNumber
					);
				}
			} catch (error) {
				console.error(
					"Could not load Qur'an page:",
					error
				);

				setError(
					"Unable to load Qur'an."
				);
			} finally {
				setLoading(false);
			}
		}

		loadPage();
	}, [pageNumber, user]);

	/*
	 * Previous page
	 */

	const goToPreviousPage = () => {
		if (pageNumber <= 1) {
			return;
		}

		setPageNumber(
			(previous) => previous - 1
		);
	};

	/*
	 * Next page
	 */

	const goToNextPage = () => {
		if (pageNumber >= 604) {
			return;
		}

		setPageNumber(
			(previous) => previous + 1
		);
	};

	/*
	 * Touch start
	 */

	const handleTouchStart = (event) => {
		if (event.touches.length !== 1) {
			return;
		}

		const touch = event.touches[0];

		setTouchStartX(touch.clientX);
		setTouchStartY(touch.clientY);
	};

	/*
	 * Touch end
	 */

	const handleTouchEnd = (event) => {
		if (
			touchStartX === null ||
			touchStartY === null
		) {
			return;
		}

		if (event.changedTouches.length !== 1) {
			setTouchStartX(null);
			setTouchStartY(null);
			return;
		}

		const touch =
			event.changedTouches[0];

		const differenceX =
			touch.clientX -
			touchStartX;

		const differenceY =
			touch.clientY -
			touchStartY;

		setTouchStartX(null);
		setTouchStartY(null);

		if (Math.abs(differenceX) < 60) {
			return;
		}

		if (
			Math.abs(differenceY) >
			Math.abs(differenceX)
		) {
			return;
		}

		if (differenceX < 0) {
			goToNextPage();
		} else {
			goToPreviousPage();
		}
	};

	/*
	 * Increase text size
	 */

	const increaseFontSize = () => {
		setFontSize(
			(previous) =>
				Math.min(
					previous + 2,
					40
				)
		);
	};

	/*
	 * Decrease text size
	 */

	const decreaseFontSize = () => {
		setFontSize(
			(previous) =>
				Math.max(
					previous - 2,
					20
				)
		);
	};

	/*
	 * Loading
	 */

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#f7f3ea]">
				<div className="flex flex-col items-center gap-3">

					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d9cdbb] border-t-[#70563f]" />

					<p className="text-sm text-[#70563f]">
						Loading...
					</p>

				</div>
			</main>
		);
	}

	/*
	 * Error
	 */

	if (error) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-6">
				<div className="text-center">

					<p className="text-sm text-[#70563f]">
						{error}
					</p>

					<button
						type="button"
						onClick={() =>
							setPageNumber(
								pageNumber
							)
						}
						className="mt-4 text-sm text-[#70563f] underline underline-offset-4"
					>
						Try again
					</button>

				</div>
			</main>
		);
	}

	return (
		<main
			className="min-h-screen bg-[#f7f3ea] text-[#3b3026]"
			onTouchStart={
				handleTouchStart
			}
			onTouchEnd={
				handleTouchEnd
			}
		>

			<div className="mx-auto flex min-h-screen max-w-5xl flex-col">

				{/* Top bar */}

				<header className="flex items-center justify-between px-5 py-5 sm:px-8">

					<a
						href="/quran"
						className="text-sm text-[#70563f] transition-opacity hover:opacity-60"
					>
						← Qur'an
					</a>

					<p className="text-xs text-[#8d7c6b]">
						Page {pageNumber} of 604
					</p>

				</header>


				{/* Mushaf page */}

				<div className="flex flex-1 items-center justify-center px-4 pb-8 sm:px-8">

					<section
						dir="rtl"
						className="w-full max-w-4xl bg-[#faf7ef] px-6 py-10 shadow-[0_2px_20px_rgba(80,60,40,0.05)] sm:px-12 sm:py-14 lg:px-20 lg:py-16"
					>

						<div className="text-center">

							<p className="text-xs text-[#9b8b7a]">
								{pageNumber}
							</p>

						</div>


						<div className="mt-8">

							<p
								className="text-right text-[#3b3026]"
								style={{
									fontSize: `${fontSize}px`,
									lineHeight: 2.5,
								}}
							>

								{page?.ayahs?.map(
									(ayah) => (
										<span
											key={
												ayah.number
											}
										>
											{ayah.text}

											<span className="mx-1 text-[0.7em] text-[#8d7c6b]">
												۝
											</span>{" "}
										</span>
									)
								)}

							</p>

						</div>

					</section>

				</div>


				{/* Reader controls */}

				<footer className="px-5 pb-7 sm:px-8">

					<div className="flex items-center justify-center gap-3">

						<button
							type="button"
							onClick={
								goToPreviousPage
							}
							disabled={
								pageNumber === 1
							}
							className="rounded-xl border border-[#d8cbbb] px-5 py-3 text-sm text-[#70563f] transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
						>
							Previous
						</button>


						<div className="flex items-center gap-1 rounded-xl border border-[#d8cbbb] px-2 py-1">

							<button
								type="button"
								onClick={
									decreaseFontSize
								}
								aria-label="Decrease text size"
								className="flex h-9 w-9 items-center justify-center text-lg text-[#70563f] transition-opacity hover:opacity-60"
							>
								−
							</button>

							<span className="text-xs text-[#9b8b7a]">
								Aa
							</span>

							<button
								type="button"
								onClick={
									increaseFontSize
								}
								aria-label="Increase text size"
								className="flex h-9 w-9 items-center justify-center text-lg text-[#70563f] transition-opacity hover:opacity-60"
							>
								+
							</button>

						</div>


						<button
							type="button"
							onClick={
								goToNextPage
							}
							disabled={
								pageNumber === 604
							}
							className="rounded-xl bg-[#70563f] px-5 py-3 text-sm text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
						>
							Next
						</button>

					</div>


					<p className="mt-4 text-center text-xs text-[#a08f7d]">
						Swipe left or right to turn the page
					</p>

				</footer>

			</div>

		</main>
	);
}

export default function QuranReader() {
	return (
		<Suspense
			fallback={
				<main className="flex min-h-screen items-center justify-center bg-[#f7f3ea]">
					<div className="flex flex-col items-center gap-3">

						<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d9cdbb] border-t-[#70563f]" />

						<p className="text-sm text-[#70563f]">
							Loading Qur'an...
						</p>

					</div>
				</main>
			}
		>
			<QuranReaderContent />
		</Suspense>
	);
}