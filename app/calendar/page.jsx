"use client";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../lib/firebase";
import { getHijriMonthCalendar } from "../../lib/aladhan";

const hijriMonths = [
	"Muharram",
	"Safar",
	"Rabi al Awwal",
	"Rabi al Thani",
	"Jumada al Awwal",
	"Jumada al Thani",
	"Rajab",
	"Sha'ban",
	"Ramadan",
	"Shawwal",
	"Dhul Qadah",
	"Dhul Hijjah",
];

const weekDays = [
	"الأحد",
	"الإثنين",
	"الثلاثاء",
	"الأربعاء",
	"الخميس",
	"الجمعة",
	"السبت",
];

/*
 * Special Islamic dates
 */

function getSpecialDay(month, day) {
	/*
	 * Ayyām al Bīḍ
	 * 13th, 14th and 15th of every Hijri month.
	 */

	if (day === 13 || day === 14 || day === 15) {
		return {
			type: "white-days",
			label: "Ayyām al Bīḍ",
		};
	}

	/*
	 * Muharram
	 */

	if (month === 1 && day === 1) {
		return {
			type: "special",
			label: "Beginning of Muharram",
		};
	}

	if (month === 1 && day === 10) {
		return {
			type: "special",
			label: "ʿĀshūrāʾ",
		};
	}

	/*
	 * Rajab
	 */

	if (month === 7 && day === 27) {
		return {
			type: "special",
			label: "Al Isrāʾ wal Miʿrāj",
		};
	}

	/*
	 * Sha'ban
	 */

	if (month === 8 && day === 15) {
		return {
			type: "special",
			label: "15 Sha'ban",
		};
	}

	/*
	 * Ramadan
	 */

	if (month === 9 && day === 1) {
		return {
			type: "special",
			label: "Beginning of Ramadan",
		};
	}

	if (month === 9 && day === 27) {
		return {
			type: "special",
			label: "Laylat al Qadr",
		};
	}

	/*
	 * Shawwal
	 */

	if (month === 10 && day === 1) {
		return {
			type: "eid",
			label: "Eid al Fitr",
		};
	}

	/*
	 * Dhul Hijjah
	 */

	if (month === 12 && day === 8) {
		return {
			type: "special",
			label: "Yawm al Tarwiyah",
		};
	}

	if (month === 12 && day === 9) {
		return {
			type: "special",
			label: "Day of ʿArafah",
		};
	}

	if (month === 12 && day === 10) {
		return {
			type: "eid",
			label: "Eid al Adha",
		};
	}

	if (month === 12 && day >= 11 && day <= 13) {
		return {
			type: "special",
			label: "Ayyām al Tashrīq",
		};
	}

	return null;
}

/*
 * Format AlAdhan data.
 *
 * No Hijri date calculations are performed here.
 * The API remains the source of truth.
 */

function formatCalendarData(data) {
	if (!Array.isArray(data)) {
		return [];
	}

	return data
		.map((entry) => {
			const hijri = entry?.date?.hijri;
			const gregorian = entry?.date?.gregorian;

			if (!hijri) {
				return null;
			}

			const hijriDay = Number(hijri.day);
			const hijriMonthNumber = Number(
				hijri.month?.number
			);

			if (
				Number.isNaN(hijriDay) ||
				Number.isNaN(hijriMonthNumber)
			) {
				return null;
			}

			const arabicDay =
				hijri.weekday?.ar || "";

			const englishDay =
				hijri.weekday?.en || "";

			const specialDay = getSpecialDay(
				hijriMonthNumber,
				hijriDay
			);

			const isFriday =
				englishDay.toLowerCase() ===
				"friday";

			return {
				hijriDay,

				hijriMonthNumber,

				hijriMonthName:
					hijri.month?.en || "",

				hijriYear:
					Number(hijri.year),

				arabicDay,

				englishDay,

				gregorianDate:
					gregorian?.date || "",

				gregorianDay:
					gregorian?.weekday?.en || "",

				specialDay,

				isFriday,
			};
		})
		.filter(Boolean);
}

/*
 * Create the visual calendar grid.
 *
 * The Gregorian date returned by AlAdhan
 * is only used to position the first day.
 */

function getCalendarGrid(days) {
	if (!days.length) {
		return [];
	}

	const firstDay = days[0];

	const gregorianDate =
		firstDay?.gregorianDate;

	if (!gregorianDate) {
		return days;
	}

	const parts = gregorianDate
		.split("-")
		.map(Number);

	if (parts.length !== 3) {
		return days;
	}

	const [day, month, year] = parts;

	if (
		Number.isNaN(day) ||
		Number.isNaN(month) ||
		Number.isNaN(year)
	) {
		return days;
	}

	const date = new Date(
		year,
		month - 1,
		day
	);

	const firstWeekday = date.getDay();

	const grid = [];

	for (let i = 0; i < firstWeekday; i++) {
		grid.push(null);
	}

	days.forEach((dayData) => {
		grid.push(dayData);
	});

	return grid;
}

export default function Calendar() {
	const [user, setUser] = useState(null);

	const [loading, setLoading] =
		useState(true);

	const [calendarLoading, setCalendarLoading] =
		useState(true);

	const [calendarData, setCalendarData] =
		useState([]);

	const [error, setError] =
		useState("");

	/*
	 * Current Hijri month
	 */

	const [hijriMonth, setHijriMonth] =
		useState(2);

	const [hijriYear, setHijriYear] =
		useState(1448);

	const [selectedDay, setSelectedDay] =
		useState(null);

	/*
	 * Authentication
	 */

	useEffect(() => {
		const unsubscribe =
			onAuthStateChanged(
				auth,
				(currentUser) => {
					setUser(currentUser);
					setLoading(false);
				}
			);

		return () => unsubscribe();
	}, []);

	/*
	 * Load Hijri calendar
	 */

	useEffect(() => {
		if (!user) {
			return;
		}

		async function loadCalendar() {
			try {
				setCalendarLoading(true);
				setError("");

				const data =
					await getHijriMonthCalendar(
						hijriMonth,
						hijriYear
					);

				const days =
					formatCalendarData(data);

				if (!days.length) {
					throw new Error(
						"No calendar dates were returned."
					);
				}

				setCalendarData(days);

				setSelectedDay(
					days[0].hijriDay
				);
			} catch (error) {
				console.error(
					"Could not load Hijri calendar:",
					error
				);

				setCalendarData([]);

				setError(
					"Unable to load the Hijri calendar."
				);
			} finally {
				setCalendarLoading(false);
			}
		}

		loadCalendar();
	}, [
		user,
		hijriMonth,
		hijriYear,
	]);

	/*
	 * Previous month
	 */

	const goToPreviousMonth = () => {
		if (hijriMonth === 1) {
			setHijriMonth(12);

			setHijriYear(
				(previousYear) =>
					previousYear - 1
			);
		} else {
			setHijriMonth(
				(previousMonth) =>
					previousMonth - 1
			);
		}
	};

	/*
	 * Next month
	 */

	const goToNextMonth = () => {
		if (hijriMonth === 12) {
			setHijriMonth(1);

			setHijriYear(
				(previousYear) =>
					previousYear + 1
			);
		} else {
			setHijriMonth(
				(previousMonth) =>
					previousMonth + 1
			);
		}
	};

	/*
	 * Current month
	 *
	 * Uses the AlAdhan API to find today's
	 * actual Hijri date.
	 */

	const goToCurrentHijriMonth =
		async () => {
			try {
				setCalendarLoading(true);
				setError("");

				const today = new Date();

				const day =
					String(
						today.getDate()
					).padStart(2, "0");

				const month =
					String(
						today.getMonth() + 1
					).padStart(2, "0");

				const year =
					today.getFullYear();

				/*
				 * AlAdhan's Gregorian calendar
				 * endpoint is not being used here.
				 *
				 * Instead, getPrayerTimes can
				 * return today's Hijri date,
				 * but the calendar page only needs
				 * the month/year.
				 *
				 * Fetch January 1st of the current
				 * Gregorian year and use API data
				 * to locate today's date.
				 */

				const response =
					await fetch(
						`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`
					);

				if (!response.ok) {
					throw new Error(
						"Unable to determine current Hijri month."
					);
				}

				const result =
					await response.json();

				if (
					result.code !== 200 ||
					!Array.isArray(result.data)
				) {
					throw new Error(
						"Invalid Hijri date response."
					);
				}

				const todayString =
					`${day}-${month}-${year}`;

				const todayEntry =
					result.data.find(
						(entry) =>
							entry?.gregorian?.date ===
							todayString
					);

				if (!todayEntry) {
					throw new Error(
						"Today's Hijri date could not be found."
					);
				}

				const currentMonth =
					Number(
						todayEntry.hijri?.month
							?.number
					);

				const currentYear =
					Number(
						todayEntry.hijri?.year
					);

				if (
					Number.isNaN(
						currentMonth
					) ||
					Number.isNaN(
						currentYear
					)
				) {
					throw new Error(
						"Invalid current Hijri date."
					);
				}

				setHijriMonth(
					currentMonth
				);

				setHijriYear(
					currentYear
				);
			} catch (error) {
				console.error(
					"Could not determine current Hijri month:",
					error
				);

				setError(
					"Unable to determine the current Hijri month."
				);

				setCalendarLoading(false);
			}
		};

	const selectedDate =
		calendarData.find(
			(day) =>
				day.hijriDay ===
				selectedDay
		);

	const calendarGrid =
		getCalendarGrid(calendarData);

	/*
	 * Loading
	 */

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

	/*
	 * Authentication
	 */

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

				<ThemeToggle />

				<div className="min-w-0 flex-1">

					<div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:py-14">

						{/* Header */}

						<section>

							<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
								CALENDAR
							</p>

							<h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
								Hijri calendar
							</h1>

							<p className="mt-3 max-w-xl text-sm leading-7 text-muted">
								Keep track of the Islamic months, dates, and important moments.
							</p>

						</section>

						{/* Calendar */}

						<section className="mt-10 rounded-3xl border border-border bg-surface p-6 sm:p-8">

							{/* Month Header */}

							<div className="flex items-center justify-between gap-4">

								<button
									type="button"
									onClick={
										goToPreviousMonth
									}
									className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-primary transition-colors hover:bg-primary hover:text-white"
									aria-label="Previous Hijri month"
								>
									←
								</button>

								<div className="text-center">

									<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
										HIJRI
									</p>

									<h2 className="mt-2 text-xl font-semibold text-primary">
										{hijriMonths[
											hijriMonth - 1
										]}
									</h2>

									<p className="mt-1 text-sm text-muted">
										{hijriYear} AH
									</p>

								</div>

								<button
									type="button"
									onClick={
										goToNextMonth
									}
									className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-primary transition-colors hover:bg-primary hover:text-white"
									aria-label="Next Hijri month"
								>
									→
								</button>

							</div>

							{/* Current Month */}

							<div className="mt-5 flex justify-center">

								<button
									type="button"
									onClick={
										goToCurrentHijriMonth
									}
									className="rounded-xl bg-soft px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
								>
									Current month
								</button>

							</div>

							{/* Loading */}

							{calendarLoading && (
								<div className="flex min-h-72 items-center justify-center">

									<div className="flex flex-col items-center gap-3">

										<div className="h-8 w-8 animate-spin rounded-full border-4 border-soft border-t-primary" />

										<p className="text-sm text-muted">
											Loading Hijri calendar...
										</p>

									</div>

								</div>
							)}

							{/* Error */}

							{!calendarLoading &&
								error && (
									<div className="flex min-h-72 items-center justify-center">

										<p className="text-sm text-muted">
											{error}
										</p>

									</div>
								)}

							{/* Calendar Grid */}

							{!calendarLoading &&
								!error &&
								calendarData.length >
									0 && (
									<>

										{/* Arabic Weekdays */}

										<div className="mt-7 grid grid-cols-7">

											{weekDays.map(
												(day) => (
													<div
														key={day}
														dir="rtl"
														className="py-3 text-center text-xs font-medium text-muted"
													>
														{day}
													</div>
												)
											)}

										</div>

										{/* Days */}

										<div className="grid grid-cols-7 gap-y-2">

											{calendarGrid.map(
												(day, index) => {

													if (!day) {
														return (
															<div
																key={`empty-${index}`}
																className="h-12 sm:h-14"
															/>
														);
													}

													const isSelected =
														day.hijriDay ===
														selectedDay;

													const isWhiteDay =
														day.specialDay
															?.type ===
														"white-days";

													const isSpecial =
														day.specialDay
															?.type ===
															"special" ||
														day.specialDay
															?.type ===
															"eid";

													const isFriday =
														day.isFriday;

													/*
													 * Normal day
													 */

													let dayClass =
														"text-foreground hover:bg-soft hover:text-primary";

													/*
													 * Ayyām al Bīḍ
													 */

													if (
														isWhiteDay
													) {
														dayClass =
															"bg-elevated text-primary hover:bg-soft";
													}

													/*
													 * Friday
													 */

													if (
														isFriday
													) {
														dayClass =
															"bg-soft text-primary hover:bg-primary hover:text-white";
													}

													/*
													 * All special dates
													 *
													 * Light green background,
													 * different from Ayyām al Bīḍ
													 * and Friday.
													 */

													if (
														isSpecial
													) {
														dayClass =
															"bg-primary-light/40 text-primary hover:bg-primary-light/60";
													}

													/*
													 * Selected date always
													 * takes priority.
													 */

													if (
														isSelected
													) {
														dayClass =
															"bg-primary text-white hover:bg-primary";
													}

													return (
														<button
															key={`${day.hijriDay}-${index}`}
															type="button"
															onClick={() =>
																setSelectedDay(
																	day.hijriDay
																)
															}
															title={
																day.specialDay
																	?.label ||
																(day.isFriday
																	? "Friday"
																	: "")
															}
															className={`mx-auto flex h-12 w-12 flex-col items-center justify-center rounded-2xl text-sm font-medium transition-colors sm:h-14 sm:w-14 ${dayClass}`}
														>

															<span>
																{
																	day.hijriDay
																}
															</span>

															{day.specialDay && (
																<span className="mt-0.5 h-1 w-1 rounded-full bg-current" />
															)}

														</button>
													);
												}
											)}

										</div>

										{/* Legend */}

										<div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-border pt-6">

											<div className="flex items-center gap-2">

												<span className="h-3 w-3 rounded-full bg-elevated" />

												<span className="text-xs text-muted">
													Ayyām al Bīḍ
												</span>

											</div>

											<div className="flex items-center gap-2">

												<span className="h-3 w-3 rounded-full bg-soft" />

												<span className="text-xs text-muted">
													Friday
												</span>

											</div>

											<div className="flex items-center gap-2">

												<span className="h-3 w-3 rounded-full bg-primary-light/40" />

												<span className="text-xs text-muted">
													Special day
												</span>

											</div>

											<div className="flex items-center gap-2">

												<span className="h-3 w-3 rounded-full bg-primary" />

												<span className="text-xs text-muted">
													Selected
												</span>

											</div>

										</div>

									</>
								)}

						</section>

						{/* Selected Date */}

						{selectedDate && (
							<section className="mt-6 grid gap-6 sm:grid-cols-2">

								{/* Hijri */}

								<article className="rounded-3xl border border-border bg-surface p-7">

									<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
										SELECTED DATE
									</p>

									<h2 className="mt-4 text-2xl font-semibold text-primary">
										{selectedDate.hijriDay}{" "}
										{hijriMonths[
											hijriMonth - 1
										]}
									</h2>

									<p className="mt-2 text-sm text-muted">
										{selectedDate.hijriYear} AH
									</p>

									{selectedDate.specialDay && (
										<div className="mt-5 inline-flex rounded-full bg-primary-light/40 px-3 py-1.5 text-xs font-medium text-primary">
											{
												selectedDate
													.specialDay
													.label
											}
										</div>
									)}

									{!selectedDate.specialDay &&
										selectedDate.isFriday && (
											<div className="mt-5 inline-flex rounded-full bg-soft px-3 py-1.5 text-xs font-medium text-primary">
												Jumu'ah
											</div>
										)}

								</article>

								{/* Arabic Weekday */}

								<article className="rounded-3xl border border-border bg-surface p-7">

									<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
										ARABIC WEEKDAY
									</p>

									<h2
										dir="rtl"
										className="mt-4 text-2xl font-semibold text-primary"
									>
										{selectedDate.arabicDay ||
											"—"}
									</h2>

									<p className="mt-2 text-sm text-muted">
										{selectedDate.gregorianDate ||
											"—"}
									</p>

								</article>

							</section>
						)}

						{/* Islamic Months */}

						<section className="mt-6 rounded-3xl border border-border bg-surface p-7 sm:p-8">

							<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
								ISLAMIC MONTHS
							</p>

							<h2 className="mt-3 text-xl font-semibold text-primary">
								Months of the Hijri year
							</h2>

							<div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

								{hijriMonths.map(
									(name, index) => {

										const monthNumber =
											index + 1;

										const isActive =
											monthNumber ===
											hijriMonth;

										return (
											<button
												key={name}
												type="button"
												onClick={() =>
													setHijriMonth(
														monthNumber
													)
												}
												className={`rounded-2xl px-5 py-4 text-left text-sm font-medium transition-colors ${
													isActive
														? "bg-primary text-white"
														: "bg-elevated text-foreground hover:bg-soft hover:text-primary"
												}`}
											>

												<span className="mr-3 text-xs opacity-60">
													{String(
														monthNumber
													).padStart(
														2,
														"0"
													)}
												</span>

												{name}

											</button>
										);
									}
								)}

							</div>

						</section>

					</div>

				</div>

			</div>

		</main>
	);
}