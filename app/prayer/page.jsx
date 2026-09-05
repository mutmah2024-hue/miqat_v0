
"use client";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

import {useEffect, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";

import {auth} from "../../lib/firebase";
import {getPrayerTimes} from "../../lib/aladhan";

import {
	getTodayPrayerProgress,
	saveTodayPrayerProgress,
} from "../../lib/firestore";

const prayerNames = [
	{
		key: "Fajr",
		label: "Fajr",
	},
	{
		key: "Dhuhr",
		label: "Dhuhr",
	},
	{
		key: "Asr",
		label: "Asr",
	},
	{
		key: "Maghrib",
		label: "Maghrib",
	},
	{
		key: "Isha",
		label: "Isha",
	},
];

function convertTo12Hour(time) {
	if (!time) return "";

	const [hours, minutes] = time.split(":");

	let hour = Number(hours);

	const period = hour >= 12 ? "PM" : "AM";

	hour = hour % 12 || 12;

	return `${String(hour).padStart(2, "0")}:${minutes} ${period}`;
}

function getNextPrayer(timings) {
	if (!timings) return null;

	const now = new Date();

	for (const prayer of prayerNames) {
		const time = timings[prayer.key];

		if (!time) continue;

		const [hours, minutes] = time.split(":").map(Number);

		const prayerTime = new Date(now);

		prayerTime.setHours(hours, minutes, 0, 0);

		if (prayerTime > now) {
			return {
				name: prayer.label,
				time,
				isTomorrow: false,
			};
		}
	}

	if (!timings.Fajr) return null;

	return {
		name: "Fajr",
		time: timings.Fajr,
		isTomorrow: true,
	};
}

function getCountdown(targetTime, isTomorrow = false) {
	if (!targetTime) return null;

	const now = new Date();

	const [hours, minutes] = targetTime.split(":").map(Number);

	const target = new Date(now);

	target.setHours(hours, minutes, 0, 0);

	if (isTomorrow || target <= now) {
		target.setDate(target.getDate() + 1);
	}

	const difference = target.getTime() - now.getTime();

	if (difference <= 0) {
		return {
			hours: "00",
			minutes: "00",
			seconds: "00",
		};
	}

	const totalSeconds = Math.floor(difference / 1000);

	const hoursLeft = Math.floor(totalSeconds / 3600);

	const minutesLeft = Math.floor((totalSeconds % 3600) / 60);

	const secondsLeft = totalSeconds % 60;

	return {
		hours: String(hoursLeft).padStart(2, "0"),
		minutes: String(minutesLeft).padStart(2, "0"),
		seconds: String(secondsLeft).padStart(2, "0"),
	};
}

export default function Prayer() {
	const [user, setUser] = useState(null);

	const [loading, setLoading] = useState(true);

	const [prayerLoading, setPrayerLoading] = useState(true);

	const [prayerData, setPrayerData] = useState(null);

	const [countdown, setCountdown] = useState(null);

	const [selectedLocation, setSelectedLocation] = useState("");

	const [error, setError] = useState("");

	const [prayerProgress, setPrayerProgress] = useState({
		Fajr: false,
		Dhuhr: false,
		Asr: false,
		Maghrib: false,
		Isha: false,
	});

	const [progressLoading, setProgressLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	/*
	 * Load today's Salah progress
	 */

	useEffect(() => {
		if (!user) return;

		async function loadPrayerProgress() {
			try {
				const progress =
					await getTodayPrayerProgress(user.uid);

				setPrayerProgress(progress);
			} catch (error) {
				console.error(
					"Could not load prayer progress:",
					error
				);
			} finally {
				setProgressLoading(false);
			}
		}

		loadPrayerProgress();
	}, [user]);

	/*
	 * Update countdown
	 */

	useEffect(() => {
		if (!prayerData?.timings) return;

		const updateCountdown = () => {
			const next = getNextPrayer(prayerData.timings);

			if (!next) {
				setCountdown(null);
				return;
			}

			setCountdown(
				getCountdown(
					next.time,
					next.isTomorrow
				)
			);
		};

		updateCountdown();

		const interval = setInterval(
			updateCountdown,
			1000
		);

		return () => clearInterval(interval);
	}, [prayerData]);

	/*
	 * Load saved location
	 */

	useEffect(() => {
		if (!user) return;

		const savedLocation =
			localStorage.getItem("miqat_location");

		if (!savedLocation) {
			setError(
				"No location has been selected yet."
			);

			setPrayerLoading(false);

			return;
		}

		try {
			const location =
				JSON.parse(savedLocation);

			setSelectedLocation(
				`${location.city}, ${location.state}`
			);

			getPrayerTimes(
				location.latitude,
				location.longitude
			)
				.then((data) => {
					setPrayerData(data);
				})
				.catch((error) => {
					console.error(error);

					setError(
						"We couldn't load your prayer times."
					);
				})
				.finally(() => {
					setPrayerLoading(false);
				});
		} catch (error) {
			console.error(error);

			setError(
				"We couldn't read your saved location."
			);

			setPrayerLoading(false);
		}
	}, [user]);

	/*
	 * Toggle Salah completion
	 */

	const togglePrayer = async (prayer) => {
		if (!user) return;

		const newValue =
			!prayerProgress[prayer];

		setPrayerProgress((previous) => ({
			...previous,
			[prayer]: newValue,
		}));

		try {
			await saveTodayPrayerProgress(
				user.uid,
				prayer,
				newValue
			);
		} catch (error) {
			console.error(
				"Could not save prayer progress:",
				error
			);

			setPrayerProgress((previous) => ({
				...previous,
				[prayer]: !newValue,
			}));
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
						You need to sign in to access Salah.
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

	const nextPrayer = getNextPrayer(
		prayerData?.timings
	);

	const completedPrayerCount =
		Object.values(prayerProgress).filter(
			Boolean
		).length;

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="flex min-h-screen">
				<Sidebar user={user} />

				{/* <ThemeToggle /> */}

				<div className="min-w-0 flex-1">
					<div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:py-14">

						{/* Header */}

						<section>
							<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
								SALAH
							</p>

							<h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
								Prayer times
							</h1>

							<p className="mt-3 max-w-xl text-sm leading-7 text-muted">
								Stay connected to your prayers throughout the day.
							</p>

							{prayerData?.date?.hijri && (
								<p className="mt-3 text-sm text-muted">
									{prayerData.date.hijri.day}{" "}
									{prayerData.date.hijri.month.en}{" "}
									{prayerData.date.hijri.year} AH
								</p>
							)}
						</section>

						{/* Next Prayer */}

						<section className="mt-10 rounded-3xl bg-primary p-7 text-white sm:p-9">
							<p className="text-xs font-medium uppercase tracking-[0.25em] text-primary-light">
								NEXT PRAYER
							</p>

							{prayerLoading ? (
								<div className="mt-6">
									<div className="h-10 w-36 animate-pulse rounded-lg bg-white/20" />

									<div className="mt-4 h-5 w-44 animate-pulse rounded bg-white/10" />
								</div>
							) : !prayerData ? (
								<div className="mt-6">
									<h2 className="text-xl font-semibold">
										Prayer times unavailable
									</h2>

									<p className="mt-3 max-w-md text-sm leading-6 text-primary-light">
										{error}
									</p>

									<a
										href="/dashboard"
										className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-primary transition-opacity hover:opacity-90"
									>
										Choose location
									</a>
								</div>
							) : nextPrayer ? (
								<div className="mt-6 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
									<div>
										<h2 className="text-4xl font-semibold">
											{nextPrayer.name}
										</h2>

										<p className="mt-2 text-sm text-primary-light">
											{nextPrayer.isTomorrow
												? "Tomorrow's first prayer"
												: "Your next prayer"}
										</p>
									</div>

									<div className="sm:text-right">
										{countdown && (
											<p className="text-4xl font-semibold tabular-nums tracking-tight">
												{countdown.hours}:
												{countdown.minutes}:
												{countdown.seconds}
											</p>
										)}

										<p className="mt-2 text-sm text-primary-light">
											remaining
										</p>

										<p className="mt-1 text-xs text-primary-light">
											{convertTo12Hour(
												nextPrayer.time
											)}{" "}
											· {selectedLocation}
										</p>
									</div>
								</div>
							) : (
								<div className="mt-6">
									<h2 className="text-3xl font-semibold">
										Fajr
									</h2>

									<p className="mt-2 text-sm text-primary-light">
										Tomorrow's first prayer
									</p>
								</div>
							)}
						</section>

						{/* Today's Prayer Times */}

						{prayerData?.timings && (
							<section className="mt-8 rounded-3xl border border-border bg-surface p-7 sm:p-8">
								<div>
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
												TODAY
											</p>

											<h2 className="mt-3 text-xl font-semibold text-primary">
												All prayer times
											</h2>

											<p className="mt-2 text-sm text-muted">
												{selectedLocation}
											</p>
										</div>

										<div className="rounded-xl bg-soft px-3 py-2 text-center">
											<p className="text-xs text-muted">
												Completed
											</p>

											<p className="mt-1 text-sm font-semibold text-primary">
												{completedPrayerCount} / 5
											</p>
										</div>
									</div>
								</div>

								<div className="mt-7 grid gap-3">
									{prayerNames.map(
										(prayer) => {
											const isNext =
												nextPrayer?.name ===
												prayer.label;

											const isCompleted =
												prayerProgress[
													prayer.key
												];

											return (
												<div
													key={prayer.key}
													className={`flex items-center justify-between rounded-2xl px-5 py-4 transition-colors ${
														isNext
															? "bg-primary text-white"
															: isCompleted
																? "bg-soft text-foreground"
																: "bg-elevated text-foreground"
													}`}
												>
													<div>
														<p
															className={`text-sm font-medium ${
																isNext
																	? "text-white"
																	: "text-foreground"
															}`}
														>
															{
																prayer.label
															}
														</p>

														{isNext && (
															<p className="mt-1 text-xs text-primary-light">
																Next prayer
															</p>
														)}

														{isCompleted &&
															!isNext && (
																<p className="mt-1 text-xs text-muted">
																	Completed
																</p>
															)}
													</div>

													<div className="flex items-center gap-4">
														<p
															className={`text-lg font-semibold ${
																isNext
																	? "text-white"
																	: "text-primary"
															}`}
														>
															{convertTo12Hour(
																prayerData
																	.timings[
																	prayer.key
																]
															)}
														</p>

														<button
															type="button"
															onClick={() =>
																togglePrayer(
																	prayer.key
																)
															}
															disabled={
																progressLoading
															}
															aria-label={
																isCompleted
																	? `Mark ${prayer.label} as incomplete`
																	: `Mark ${prayer.label} as completed`
															}
															className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
																isCompleted
																	? "border-primary bg-primary text-white"
																	: isNext
																		? "border-white/60 text-white hover:border-white"
																		: "border-border text-transparent hover:border-primary"
															}`}
														>
															{isCompleted &&
																"✓"}
														</button>
													</div>
												</div>
											);
										}
									)}
								</div>
							</section>
						)}

						{/* Prayer Information */}

						<section className="mt-8 grid gap-6 sm:grid-cols-2">
							<article className="rounded-3xl border border-border bg-surface p-7">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
									LOCATION
								</p>

								<h2 className="mt-4 text-xl font-semibold text-primary">
									{selectedLocation ||
										"Location not selected"}
								</h2>

								<p className="mt-3 text-sm leading-7 text-muted">
									Prayer times are calculated using your selected location.
								</p>

								<a
									href="/dashboard"
									className="mt-5 inline-flex rounded-xl bg-soft px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
								>
									Change location
								</a>
							</article>

							<article className="rounded-3xl border border-border bg-surface p-7">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
									TODAY
								</p>

								<h2 className="mt-4 text-xl font-semibold text-primary">
									Stay intentional
								</h2>

								<p className="mt-3 text-sm leading-7 text-muted">
									Let each prayer create a pause in your day and bring your attention back to what matters.
								</p>
							</article>
						</section>

					</div>
				</div>
			</div>
		</main>
	);
}

