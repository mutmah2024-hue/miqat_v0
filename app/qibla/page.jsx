"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

const LATITUDE_KEY = "miqat_qibla_latitude";
const LONGITUDE_KEY = "miqat_qibla_longitude";

export default function Qibla() {
	const [qiblaDirection, setQiblaDirection] =
		useState(null);

	const [heading, setHeading] = useState(0);

	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");

	const [locationMode, setLocationMode] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [showManualLocation, setShowManualLocation] =
		useState(false);

	const [compassSupported, setCompassSupported] =
		useState(true);

	const [compassPermissionNeeded, setCompassPermissionNeeded] =
		useState(false);

	/*
	 * Keep the raw compass value outside React state.
	 * The sensor can fire many times per second.
	 */
	const headingRef = useRef(null);

	const smoothHeadingRef = useRef(null);

	// GET QIBLA FROM ALADHAN
	const getQiblaDirection = async (lat, lon) => {
		try {
			const response = await fetch(
				`https://api.aladhan.com/v1/qibla/${lat}/${lon}`
			);

			if (!response.ok) {
				throw new Error("Failed to contact AlAdhan.");
			}

			const result = await response.json();

			if (result.code !== 200 || !result.data) {
				throw new Error(
					"Unable to get Qibla direction."
				);
			}

			setQiblaDirection(result.data.direction);

			return true;
		} catch (err) {
			console.error("AlAdhan error:", err);

			setError(
				"Unable to calculate the Qibla direction."
			);

			return false;
		}
	};

	// AUTOMATIC LOCATION
	const getCurrentLocation = () => {
		setLoading(true);
		setError(null);

		if (!navigator.geolocation) {
			setLoading(false);
			setShowManualLocation(true);

			setError(
				"Your browser does not support location services. You can enter your location manually below."
			);

			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const lat = position.coords.latitude;
				const lon = position.coords.longitude;

				setLatitude(lat.toString());
				setLongitude(lon.toString());

				const success =
					await getQiblaDirection(lat, lon);

				if (success) {
					setLocationMode("automatic");
					setShowManualLocation(false);
					setError(null);
				}

				setLoading(false);
			},

			(error) => {
				console.error("Geolocation error:", error);

				setLoading(false);
				setShowManualLocation(true);

				if (error.code === 1) {
					setError(
						"Location permission was denied. You can enter your location manually below."
					);
				} else if (error.code === 2) {
					setError(
						"Your device could not determine your location. You can enter your location manually below."
					);
				} else if (error.code === 3) {
					setError(
						"Location detection timed out. You can enter your location manually below."
					);
				} else {
					setError(
						"Unable to determine your location. You can enter it manually below."
					);
				}
			},

			{
				enableHighAccuracy: false,
				timeout: 30000,
				maximumAge: 300000,
			}
		);
	};

	// MANUAL LOCATION
	const useManualLocation = async () => {
		setError(null);

		if (!latitude || !longitude) {
			setError(
				"Please enter both latitude and longitude."
			);

			return;
		}

		const lat = Number(latitude);
		const lon = Number(longitude);

		if (
			Number.isNaN(lat) ||
			Number.isNaN(lon) ||
			lat < -90 ||
			lat > 90 ||
			lon < -180 ||
			lon > 180
		) {
			setError(
				"Please enter valid latitude and longitude values."
			);

			return;
		}

		setLoading(true);

		const success =
			await getQiblaDirection(lat, lon);

		if (success) {
			localStorage.setItem(
				LATITUDE_KEY,
				latitude
			);

			localStorage.setItem(
				LONGITUDE_KEY,
				longitude
			);

			setLocationMode("manual");
			setShowManualLocation(false);
			setError(null);
		}

		setLoading(false);
	};

	// LOAD SAVED LOCATION OR GET CURRENT LOCATION
	useEffect(() => {
		const savedLatitude =
			localStorage.getItem(LATITUDE_KEY);

		const savedLongitude =
			localStorage.getItem(LONGITUDE_KEY);

		if (savedLatitude && savedLongitude) {
			setLatitude(savedLatitude);
			setLongitude(savedLongitude);

			const loadSavedLocation = async () => {
				const success =
					await getQiblaDirection(
						Number(savedLatitude),
						Number(savedLongitude)
					);

				if (success) {
					setLocationMode("manual");
					setShowManualLocation(false);
					setError(null);
				} else {
					setShowManualLocation(true);
				}

				setLoading(false);
			};

			loadSavedLocation();
		} else {
			getCurrentLocation();
		}
	}, []);

	/*
	 * Convert a raw compass reading into a heading.
	 */
	const getRawHeading = (event) => {
		let rawHeading = null;

		/*
		 * iOS Safari provides the best compass value
		 * through webkitCompassHeading.
		 */
		if (
			typeof event.webkitCompassHeading ===
				"number" &&
			!Number.isNaN(
				event.webkitCompassHeading
			)
		) {
			rawHeading =
				event.webkitCompassHeading;
		}

		/*
		 * Other browsers may provide alpha.
		 */
		else if (
			typeof event.alpha === "number"
		) {
			rawHeading =
				360 - event.alpha;
		}

		if (rawHeading === null) {
			return null;
		}

		let screenAngle = 0;

		if (
			typeof window !== "undefined" &&
			window.screen?.orientation
		) {
			screenAngle =
				window.screen.orientation.angle ||
				0;
		} else if (
			typeof window !== "undefined" &&
			typeof window.orientation === "number"
		) {
			screenAngle = window.orientation;
		}

		const correctedHeading =
			rawHeading + screenAngle;

		return (
			(correctedHeading + 360) % 360
		);
	};

	/*
	 * Smooth circular compass values.
	 *
	 * Normal averaging does not work properly around
	 * 0° / 360°, so we calculate the shortest rotation.
	 */
	const smoothHeading = (newHeading) => {
		if (smoothHeadingRef.current === null) {
			smoothHeadingRef.current = newHeading;

			return newHeading;
		}

		const current =
			smoothHeadingRef.current;

		let difference =
			newHeading - current;

		if (difference > 180) {
			difference -= 360;
		}

		if (difference < -180) {
			difference += 360;
		}

		/*
		 * Ignore tiny sensor noise.
		 */
		if (Math.abs(difference) < 1.5) {
			return current;
		}

		/*
		 * Move only part of the distance toward
		 * the new sensor reading.
		 */
		const smoothing = 0.15;

		let next =
			current +
			difference * smoothing;

		next = (next + 360) % 360;

		smoothHeadingRef.current = next;

		return next;
	};

	/*
	 * DEVICE COMPASS
	 */
	const handleOrientation = (event) => {
		const rawHeading =
			getRawHeading(event);

		if (rawHeading === null) {
			return;
		}

		headingRef.current = rawHeading;

		const stableHeading =
			smoothHeading(rawHeading);

		setHeading(stableHeading);
	};

	/*
	 * START COMPASS
	 */
	const startCompass = async () => {
		try {
			if (
				typeof DeviceOrientationEvent !==
					"undefined" &&
				typeof DeviceOrientationEvent.requestPermission ===
					"function"
			) {
				const permission =
					await DeviceOrientationEvent.requestPermission(
						true
					);

				if (permission !== "granted") {
					setCompassSupported(false);
					setCompassPermissionNeeded(false);

					return;
				}
			}

			setCompassPermissionNeeded(false);
			setCompassSupported(true);

			window.addEventListener(
				"deviceorientation",
				handleOrientation,
				true
			);
		} catch (err) {
			console.error(
				"Compass permission error:",
				err
			);

			setCompassSupported(false);
			setCompassPermissionNeeded(false);
		}
	};

	/*
	 * INITIALISE COMPASS
	 */
	useEffect(() => {
		if (
			typeof window === "undefined" ||
			typeof DeviceOrientationEvent ===
				"undefined"
		) {
			setCompassSupported(false);

			return;
		}

		/*
		 * iOS requires permission from a button click.
		 */
		if (
			typeof DeviceOrientationEvent.requestPermission ===
			"function"
		) {
			setCompassPermissionNeeded(true);

			return;
		}

		window.addEventListener(
			"deviceorientation",
			handleOrientation,
			true
		);

		return () => {
			window.removeEventListener(
				"deviceorientation",
				handleOrientation,
				true
			);
		};
	}, []);

	const getCardinalDirection = (degrees) => {
		const directions = [
			"N",
			"NE",
			"E",
			"SE",
			"S",
			"SW",
			"W",
			"NW",
		];

		const index =
			Math.round(degrees / 45) % 8;

		return directions[index];
	};

	const getDifference = () => {
		if (qiblaDirection === null) {
			return 0;
		}

		return Math.abs(
			((qiblaDirection - heading + 540) %
				360) -
				180
		);
	};

	const difference = getDifference();

	const isAligned = difference <= 5;

	const compassRotation = -heading;

	const qiblaRotation =
		qiblaDirection !== null
			? qiblaDirection
			: 0;

	return (
		<div className="min-h-screen overflow-x-hidden bg-background text-primary">
			<Sidebar />

			<main className="ml-0 min-h-screen px-5 py-4 md:ml-64 md:px-8 md:py-5">
				<div className="mx-auto max-w-5xl">
					{/* HEADER */}
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-muted">
								Mīqāt
							</p>

							<h1 className="mt-1 text-3xl font-semibold tracking-tight">
								Qibla
							</h1>

							<p className="mt-1 max-w-xl text-sm text-muted">
								Find the direction of the Ka'bah
								from your location.
							</p>
						</div>

						<ThemeToggle />
					</div>

					{/* ERROR */}
					{error && (
						<div className="mt-5 rounded-2xl border border-border bg-surface p-5">
							<p className="text-sm text-primary">
								{error}
							</p>

							<button
								onClick={
									getCurrentLocation
								}
								className="mt-3 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
							>
								Try again
							</button>
						</div>
					)}

					{/* MANUAL LOCATION */}
					{showManualLocation && (
						<div className="mt-5 rounded-2xl border border-border bg-surface p-5">
							<h2 className="text-lg font-semibold">
								Enter your location
							</h2>

							<p className="mt-1.5 text-sm leading-6 text-muted">
								Your coordinates will be
								saved on this device after
								they are successfully used.
							</p>

							<div className="mt-4 grid gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-1.5 block text-sm text-muted">
										Latitude
									</label>

									<input
										type="number"
										step="any"
										placeholder="e.g. 7.37756"
										value={
											latitude
										}
										onChange={(e) =>
											setLatitude(
												e.target.value
											)
										}
										className="w-full rounded-xl border border-border bg-background px-4 py-3 text-primary outline-none transition focus:border-primary"
									/>
								</div>

								<div>
									<label className="mb-1.5 block text-sm text-muted">
										Longitude
									</label>

									<input
										type="number"
										step="any"
										placeholder="e.g. 3.90591"
										value={
											longitude
										}
										onChange={(e) =>
											setLongitude(
												e.target.value
											)
										}
										className="w-full rounded-xl border border-border bg-background px-4 py-3 text-primary outline-none transition focus:border-primary"
									/>
								</div>
							</div>

							<button
								onClick={
									useManualLocation
								}
								disabled={loading}
								className="mt-4 w-full rounded-xl bg-primary px-5 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
							>
								{loading
									? "Calculating..."
									: "Use this location"}
							</button>
						</div>
					)}

					{/* LOADING */}
					{loading && (
						<div className="mt-12 flex flex-col items-center justify-center text-center">
							<div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />

							<p className="mt-4 text-sm text-muted">
								Determining your location...
							</p>
						</div>
					)}

					{/* QIBLA */}
					{!loading &&
						qiblaDirection !== null && (
							<div className="mt-6">
								<div className="grid gap-6 lg:grid-cols-[1fr_280px]">
									{/* COMPASS */}
									<div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
										<div className="flex flex-col items-center">
											<div className="relative w-full max-w-[380px]">
												<div className="relative aspect-square">
													{/* FIXED INDICATOR */}
													<div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
														<div className="h-0 w-0 border-l-[7px] border-r-[7px] border-t-[13px] border-l-transparent border-r-transparent border-t-primary" />
													</div>

													{/* COMPASS */}
													<div
														className="absolute inset-4 rounded-full border border-border bg-background will-change-transform"
														style={{
															transform: `rotate(${compassRotation}deg)`,
															transition:
																"transform 180ms linear",
														}}
													>
														{/* N */}
														<div className="absolute left-1/2 top-[8%] -translate-x-1/2 text-sm font-medium">
															N
														</div>

														{/* E */}
														<div className="absolute right-[8%] top-1/2 -translate-y-1/2 text-sm font-medium">
															E
														</div>

														{/* S */}
														<div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 text-sm font-medium">
															S
														</div>

														{/* W */}
														<div className="absolute left-[8%] top-1/2 -translate-y-1/2 text-sm font-medium">
															W
														</div>

														{/* SUBTLE CARDINAL MARKS */}
														<div className="absolute left-1/2 top-[5%] h-3 w-px -translate-x-1/2 bg-border" />

														<div className="absolute right-[5%] top-1/2 h-px w-3 -translate-y-1/2 bg-border" />

														<div className="absolute bottom-[5%] left-1/2 h-3 w-px -translate-x-1/2 bg-border" />

														<div className="absolute left-[5%] top-1/2 h-px w-3 -translate-y-1/2 bg-border" />

														{/* QIBLA */}
														<div
															className="absolute left-1/2 top-1/2 h-full w-full"
															style={{
																transform: `translate(-50%, -50%) rotate(${qiblaRotation}deg)`,
															}}
														>
															<div className="absolute left-1/2 top-[8%] -translate-x-1/2">
																<div className="h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
															</div>
														</div>

														{/* CENTER */}
														<div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-surface">
															<div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
														</div>
													</div>
												</div>

												{/* QIBLA VALUE */}
												<div className="mt-4 text-center">
													<p className="text-sm text-muted">
														Qibla
													</p>

													<p className="mt-1 text-3xl font-semibold">
														{Math.round(
															qiblaDirection
														)}
														°
													</p>

													<p className="mt-1 text-sm text-muted">
														{
															getCardinalDirection(
																qiblaDirection
															)
														}
													</p>
												</div>
											</div>

											{/* HEADING */}
											<div className="mt-6 flex items-center gap-5 rounded-2xl border border-border bg-background px-5 py-4">
												<div>
													<p className="text-xs text-muted">
														Your heading
													</p>

													<p className="mt-1 text-xl font-semibold tabular-nums">
														{Math.round(
															heading
														)}
														°
													</p>
												</div>

												<div className="h-8 w-px bg-border" />

												<div>
													<p className="text-xs text-muted">
														Direction
													</p>

													<p className="mt-1 text-xl font-semibold">
														{
															getCardinalDirection(
																heading
															)
														}
													</p>
												</div>
											</div>

											{/* IOS COMPASS PERMISSION */}
											{compassPermissionNeeded && (
												<div className="mt-5 text-center">
													<p className="text-sm leading-6 text-muted">
														Allow compass
														access to use
														the live Qibla
														compass.
													</p>

													<button
														onClick={
															startCompass
														}
														className="mt-3 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
													>
														Enable compass
													</button>
												</div>
											)}

											{!compassPermissionNeeded &&
												(compassSupported ? (
													<p className="mt-5 max-w-md text-center text-sm leading-6 text-muted">
														Hold your phone
														flat and slowly
														turn until the
														Qibla marker is
														at the top.
													</p>
												) : (
													<p className="mt-5 max-w-md text-center text-sm leading-6 text-muted">
														Your device does
														not provide
														compass
														orientation
														data.
													</p>
												))}
										</div>
									</div>

									{/* INFORMATION */}
									<div className="space-y-4">
										<div className="rounded-2xl border border-border bg-surface p-5">
											<p className="text-sm text-muted">
												Qibla direction
											</p>

											<p className="mt-1.5 text-3xl font-semibold">
												{Math.round(
													qiblaDirection
												)}
												°
											</p>

											<p className="mt-1 text-sm text-muted">
												{
													getCardinalDirection(
														qiblaDirection
													)
												}
											</p>
										</div>

										<div className="rounded-2xl border border-border bg-surface p-5">
											<p className="text-sm text-muted">
												You are
											</p>

											<p className="mt-1.5 text-3xl font-semibold">
												{Math.round(
													difference
												)}
												°
											</p>

											<p className="mt-1 text-sm text-muted">
												away from Qibla
											</p>
										</div>

										<div
											className={`rounded-2xl border p-5 ${
												isAligned
													? "border-primary bg-primary/10"
													: "border-border bg-surface"
											}`}
										>
											<p className="text-sm text-muted">
												Alignment
											</p>

											<p className="mt-1.5 text-lg font-semibold">
												{isAligned
													? "Qibla aligned"
													: "Keep rotating"}
											</p>

											<p className="mt-1 text-sm leading-6 text-muted">
												{isAligned
													? "You are facing the Qibla."
													: "Turn slowly until the Qibla marker reaches the indicator."}
											</p>
										</div>

										<div className="rounded-2xl border border-border bg-surface p-5">
											<div className="flex items-center justify-between">
												<p className="text-sm text-muted">
													Location
												</p>

												<span className="rounded-full bg-soft px-3 py-1 text-xs font-medium text-primary">
													{locationMode ===
													"manual"
														? "Manual"
														: "Automatic"}
												</span>
											</div>

											<p className="mt-3 text-sm">
												{Number(
													latitude
												).toFixed(4)}
												°,{" "}
												{Number(
													longitude
												).toFixed(4)}
												°
											</p>

											<button
												onClick={() =>
													setShowManualLocation(
														true
													)
												}
												className="mt-3 text-sm font-medium text-primary underline underline-offset-4"
											>
												Change location
											</button>
										</div>
									</div>
								</div>
							</div>
						)}
				</div>
			</main>
		</div>
	);
}

