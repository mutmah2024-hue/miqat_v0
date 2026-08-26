"use client";

import {useEffect, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";

import Sidebar from "../components/Sidebar";

import {auth} from "../../lib/firebase";
import {getQuranSurahs} from "../../lib/alquran";

import {
	getQuranSettings,
	saveQuranDailyGoal,
	getTodayQuranProgress,
} from "../../lib/firestore";

export default function Quran() {
	const [user, setUser] = useState(null);

	const [surahs, setSurahs] = useState([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [search, setSearch] = useState("");
	const [pageInput, setPageInput] = useState("");

	const [dailyGoal, setDailyGoal] = useState(5);
	const [pagesRead, setPagesRead] = useState(0);
	const [lastPage, setLastPage] = useState(1);

	const [customGoal, setCustomGoal] = useState("");
	const [showCustomGoal, setShowCustomGoal] = useState(false);

	const [savingGoal, setSavingGoal] = useState(false);


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
	 * Load Qur'an dashboard
	 */

	useEffect(() => {
		if (!user) return;

		async function loadQuranDashboard() {
			try {
				const [
					surahData,
					settings,
					progress,
				] = await Promise.all([
					getQuranSurahs(),
					getQuranSettings(user.uid),
					getTodayQuranProgress(user.uid),
				]);

				setSurahs(surahData);

				setDailyGoal(
					settings.dailyGoal ?? 5
				);

				setLastPage(
					settings.lastPage ?? 1
				);

				setPagesRead(
					progress.pagesRead ?? 0
				);
			} catch (error) {
				console.error(
					"Could not load Qur'an dashboard:",
					error
				);

				setError(
					"Unable to load Qur'an."
				);
			} finally {
				setLoading(false);
			}
		}

		loadQuranDashboard();
	}, [user]);


	/*
	 * Search Surahs
	 */

	const filteredSurahs = surahs.filter(
		(surah) => {
			const query =
				search.trim().toLowerCase();

			if (!query) {
				return true;
			}

			return (
				surah.name
					.toLowerCase()
					.includes(query) ||
				surah.englishName
					.toLowerCase()
					.includes(query) ||
				surah.englishNameTranslation
					?.toLowerCase()
					.includes(query) ||
				String(surah.number)
					.includes(query)
			);
		}
	);


	/*
	 * Open Qur'an page
	 */

	const openPage = () => {
		const page = Number(pageInput);

		if (
			!page ||
			page < 1 ||
			page > 604
		) {
			return;
		}

		window.location.href =
			`/quran/reader?page=${page}`;
	};


	/*
	 * Open Surah
	 */

	const openSurah = (surahNumber) => {
		window.location.href =
			`/quran/reader?surah=${surahNumber}`;
	};


	/*
	 * Continue reading
	 */

	const continueReading = () => {
		window.location.href =
			`/quran/reader?page=${lastPage}`;
	};


	/*
	 * Save daily goal
	 */

	const handleGoalChange = async (goal) => {
		if (!user || savingGoal) return;

		try {
			setSavingGoal(true);

			setDailyGoal(goal);
			setShowCustomGoal(false);

			await saveQuranDailyGoal(
				user.uid,
				goal
			);
		} catch (error) {
			console.error(
				"Could not save Qur'an daily goal:",
				error
			);

			setError(
				"Unable to save your Qur'an goal."
			);
		} finally {
			setSavingGoal(false);
		}
	};


	/*
	 * Custom daily goal
	 */

	const handleCustomGoal = () => {
		const goal = Number(customGoal);

		if (
			!goal ||
			goal < 1 ||
			goal > 604
		) {
			return;
		}

		handleGoalChange(goal);
	};


	/*
	 * Daily progress
	 */

	const progress =
		dailyGoal > 0
			? Math.min(
					(pagesRead / dailyGoal) * 100,
					100
				)
			: 0;


	/*
	 * Loading
	 */

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-background">

				<div className="flex flex-col items-center gap-3">

					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

					<p className="text-sm text-muted">
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
			<main className="flex min-h-screen items-center justify-center bg-background px-6">

				<div className="text-center">

					<p className="text-sm text-muted">
						{error}
					</p>

				</div>

			</main>
		);
	}


	/*
	 * Not signed in
	 */

	if (!user) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-background px-6">

				<div className="text-center">

					<p className="text-sm text-muted">
						You need to sign in to read the Qur'an.
					</p>

					<a
						href="/Signinup"
						className="mt-5 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
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

				<Sidebar />

				<div className="min-w-0 flex-1">


					{/* Header */}

					<header className="border-b border-border">

						<div className="mx-auto max-w-5xl px-6 py-7 sm:px-8">

							<p className="text-xs tracking-[0.2em] text-muted">
								QUR'AN
							</p>

							<h1 className="mt-2 text-2xl font-semibold">
								Read Qur'an
							</h1>

							<p className="mt-2 text-sm text-muted">
								Continue your reading or find a place in the Qur'an.
							</p>

						</div>

					</header>


					<div className="mx-auto max-w-5xl px-6 py-10 pb-24 sm:px-8 lg:py-14">


						{/* Continue Reading */}

						<section className="rounded-3xl bg-primary px-7 py-8 text-white sm:px-9">

							<p className="text-xs tracking-[0.2em] text-white/60">
								CONTINUE READING
							</p>

							<h2 className="mt-4 text-2xl font-semibold text-white">
								{lastPage === 1
									? "Begin your reading"
									: `Continue from page ${lastPage}`}
							</h2>

							<p className="mt-2 text-sm text-white/75">
								{lastPage === 1
									? "Start reading the Qur'an from the beginning."
									: "Continue from where you last stopped."}
							</p>

							<button
								type="button"
								onClick={continueReading}
								className="mt-7 rounded-xl bg-background px-5 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-80"
							>
								{lastPage === 1
									? "Start Reading"
									: "Continue Reading"}
							</button>

						</section>


						{/* Daily Goal */}

						<section className="mt-8 rounded-3xl border border-border bg-card p-7 sm:p-8">

							<div className="flex items-start justify-between gap-6">

								<div>

									<p className="text-xs tracking-[0.2em] text-muted">
										TODAY'S GOAL
									</p>

									<h2 className="mt-3 text-xl font-semibold">
										{pagesRead} of {dailyGoal} pages
									</h2>

								</div>

								<p className="text-sm text-muted">
									{Math.round(progress)}%
								</p>

							</div>


							{/* Progress Bar */}

							<div className="mt-6 h-2 overflow-hidden rounded-full bg-muted/20">

								<div
									className="h-full rounded-full bg-primary transition-all duration-500"
									style={{
										width: `${progress}%`,
									}}
								/>

							</div>


							{/* Goal Choices */}

							<div className="mt-6 flex flex-wrap gap-2">

								{[5, 10, 20, 30].map(
									(goal) => (
										<button
											key={goal}
											type="button"
											onClick={() =>
												handleGoalChange(
													goal
												)
											}
											disabled={savingGoal}
											className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
												dailyGoal === goal
													? "bg-primary text-white"
													: "bg-muted/10 text-foreground hover:bg-muted/20"
											} ${
												savingGoal
													? "cursor-not-allowed opacity-50"
													: ""
											}`}
										>
											{goal} pages
										</button>
									)
								)}


								<button
									type="button"
									onClick={() =>
										setShowCustomGoal(
											!showCustomGoal
										)
									}
									className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
										showCustomGoal
											? "bg-primary text-white"
											: "bg-muted/10 text-foreground hover:bg-muted/20"
									}`}
								>
									Custom
								</button>

							</div>


							{/* Custom Goal */}

							{showCustomGoal && (
								<div className="mt-4 flex gap-2">

									<input
										type="number"
										min="1"
										max="604"
										value={customGoal}
										onChange={(event) =>
											setCustomGoal(
												event.target.value
											)
										}
										onKeyDown={(event) => {
											if (
												event.key === "Enter"
											) {
												handleCustomGoal();
											}
										}}
										placeholder="Pages"
										className="h-11 w-28 rounded-xl border border-border bg-background px-3 text-sm outline-none placeholder:text-muted focus:border-primary"
									/>

									<button
										type="button"
										onClick={
											handleCustomGoal
										}
										disabled={savingGoal}
										className="rounded-xl bg-primary px-4 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
									>
										Set
									</button>

								</div>
							)}

						</section>


						{/* Find Your Place */}

						<section className="mt-10">

							<p className="text-xs tracking-[0.2em] text-muted">
								FIND YOUR PLACE
							</p>


							<div className="mt-4 grid gap-4 sm:grid-cols-2">


								{/* Search Surah */}

								<div className="rounded-3xl border border-border bg-card p-6">

									<p className="text-sm font-medium">
										Search Surah
									</p>

									<p className="mt-1 text-xs text-muted">
										Find a Surah by name or number.
									</p>

									<input
										type="text"
										value={search}
										onChange={(event) =>
											setSearch(
												event.target.value
											)
										}
										placeholder="Search Surah..."
										className="mt-5 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none placeholder:text-muted focus:border-primary"
									/>

								</div>


								{/* Go To Page */}

								<div className="rounded-3xl border border-border bg-card p-6">

									<p className="text-sm font-medium">
										Go to page
									</p>

									<p className="mt-1 text-xs text-muted">
										Enter a Mushaf page from 1 to 604.
									</p>

									<div className="mt-5 flex gap-2">

										<input
											type="number"
											min="1"
											max="604"
											value={pageInput}
											onChange={(event) =>
												setPageInput(
													event.target.value
												)
											}
											onKeyDown={(event) => {
												if (
													event.key === "Enter"
												) {
													openPage();
												}
											}}
											placeholder="Page"
											className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none placeholder:text-muted focus:border-primary"
										/>

										<button
											type="button"
											onClick={openPage}
											className="rounded-xl bg-primary px-5 text-sm font-medium text-white transition-opacity hover:opacity-80"
										>
											Go
										</button>

									</div>

								</div>

							</div>

						</section>


						{/* Surah List */}

						<section className="mt-10">

							<div className="flex items-end justify-between">

								<div>

									<p className="text-xs tracking-[0.2em] text-muted">
										SURAHS
									</p>

									<h2 className="mt-2 text-xl font-semibold">
										114 Surahs
									</h2>

								</div>

								<p className="text-xs text-muted">
									{filteredSurahs.length} results
								</p>

							</div>


							<div className="mt-5 divide-y divide-border border-y border-border">

								{filteredSurahs.map(
									(surah) => (
										<button
											key={surah.number}
											type="button"
											onClick={() =>
												openSurah(
													surah.number
												)
											}
											className="flex w-full items-center gap-4 px-2 py-5 text-left transition-opacity hover:opacity-60"
										>

											<span className="w-8 text-sm text-muted">
												{String(
													surah.number
												).padStart(
													2,
													"0"
												)}
											</span>


											<span className="min-w-0 flex-1">

												<span className="block text-sm font-medium">
													{surah.englishName}
												</span>

												<span className="mt-1 block text-xs text-muted">
													{surah.revelationType}{" "}
													·{" "}
													{surah.numberOfAyahs}{" "}
													ayahs
												</span>

											</span>


											<span
												dir="rtl"
												className="text-xl text-foreground"
											>
												{surah.name}
											</span>

										</button>
									)
								)}


								{filteredSurahs.length === 0 && (
									<div className="px-4 py-10 text-center">

										<p className="text-sm text-muted">
											No Surah found.
										</p>

									</div>
								)}

							</div>

						</section>

					</div>

				</div>

			</div>

		</main>
	);
}