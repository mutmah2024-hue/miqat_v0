"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

const LATITUDE_KEY = "miqat_qibla_latitude";
const LONGITUDE_KEY = "miqat_qibla_longitude";

export default function Qibla() {
	const [qiblaDirection, setQiblaDirection] = useState(null);
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

	// --------------------------------------------------
	// GET QIBLA FROM ALADHAN
	// --------------------------------------------------

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
				throw new Error("Unable to get Qibla direction.");
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

	// --------------------------------------------------
	// AUTOMATIC LOCATION
	// --------------------------------------------------

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

				const success = await getQiblaDirection(
					lat,
					lon
				);

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

	// --------------------------------------------------
	// MANUAL LOCATION
	// --------------------------------------------------

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

		const success = await getQiblaDirection(lat, lon);

		if (success) {
			// Save only after the coordinates
			// successfully return a Qibla direction.
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

	// --------------------------------------------------
	// LOAD SAVED LOCATION OR GET CURRENT LOCATION
	// --------------------------------------------------

	useEffect(() => {
		const savedLatitude =
			localStorage.getItem(LATITUDE_KEY);

		const savedLongitude =
			localStorage.getItem(LONGITUDE_KEY);

		if (savedLatitude && savedLongitude) {
			setLatitude(savedLatitude);
			setLongitude(savedLongitude);

			const loadSavedLocation = async () => {
				const success = await getQiblaDirection(
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

	// --------------------------------------------------
	// DEVICE COMPASS
	// --------------------------------------------------

	useEffect(() => {
		const handleOrientation = (event) => {
			let newHeading = null;

			// iPhone / iPad
			if (
				typeof event.webkitCompassHeading ===
				"number"
			) {
				newHeading = event.webkitCompassHeading;
			}

			// Other devices
			else if (typeof event.alpha === "number") {
				newHeading = 360 - event.alpha;
			}

			if (newHeading !== null) {
				setHeading(
					(newHeading + 360) % 360
				);
			}
		};

		if (
			typeof window !== "undefined" &&
			typeof DeviceOrientationEvent !==
				"undefined"
		) {
			window.addEventListener(
				"deviceorientation",
				handleOrientation,
				true
			);
		} else {
			setCompassSupported(false);
		}

		return () => {
			window.removeEventListener(
				"deviceorientation",
				handleOrientation,
				true
			);
		};
	}, []);

	// --------------------------------------------------
	// CARDINAL DIRECTION
	// --------------------------------------------------

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

	// --------------------------------------------------
	// QIBLA DIFFERENCE
	// --------------------------------------------------

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

	const qiblaOnDial =
		qiblaDirection !== null
			? qiblaDirection
			: 0;

	// --------------------------------------------------
	// RENDER
	// --------------------------------------------------

	return (
		<div className="min-h-screen bg-background text-primary">
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
												e
													.target
													.value
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
												e
													.target
													.value
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
							<div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />

							<p className="mt-4 text-sm text-muted">
								Determining your location...
							</p>
						</div>
					)}

					{/* COMPASS */}

					{!loading &&
						qiblaDirection !== null && (
							<div className="mt-6">
								<div className="grid gap-6 lg:grid-cols-[1fr_280px]">
									{/* COMPASS */}

									<div className="rounded-3xl border border-border bg-surface p-5 sm:p-8">
										<div className="flex flex-col items-center">
											<div className="relative aspect-square w-full max-w-[440px]">
												{/* TOP INDICATOR */}

												<div className="absolute left-1/2 top-0 z-30 -translate-x-1/2">
													<div className="h-0 w-0 border-l-[9px] border-r-[9px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary" />
												</div>

												{/* DIAL */}

												<div
													className="absolute inset-0 rounded-full border-2 border-border bg-background transition-transform duration-300 ease-out"
													style={{
														transform: `rotate(${compassRotation}deg)`,
													}}
												>
													{/* TICKS */}

													{Array.from(
														{
															length: 72,
														},
														(
															_,
															index
														) => {
															const angle =
																index *
																5;

															const isMajor =
																angle %
																	45 ===
																0;

															return (
																<div
																	key={
																		angle
																	}
																	className="absolute left-1/2 top-1/2 origin-bottom"
																	style={{
																		height:
																			isMajor
																				? "44%"
																				: "46%",
																		transform: `translateX(-50%) rotate(${angle}deg)`,
																	}}
																>
																	<div
																		className={
																			isMajor
																				? "mx-auto h-5 w-0.5 bg-primary"
																				: "mx-auto h-2.5 w-px bg-border"
																		}
																	/>
																</div>
															);
														}
													)}

													{/* NORTH */}

													<div className="absolute left-1/2 top-[7%] -translate-x-1/2 text-lg font-semibold">
														N
													</div>

													{/* EAST */}

													<div className="absolute right-[8%] top-1/2 -translate-y-1/2 text-lg font-semibold">
														E
													</div>

													{/* SOUTH */}

													<div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 text-lg font-semibold">
														S
													</div>

													{/* WEST */}

													<div className="absolute left-[8%] top-1/2 -translate-y-1/2 text-lg font-semibold">
														W
													</div>

													{/* QIBLA MARKER */}

													<div
														className="absolute left-1/2 top-1/2 h-full w-full"
														style={{
															transform: `translate(-50%, -50%) rotate(${qiblaOnDial}deg)`,
														}}
													>
														<div className="absolute left-1/2 top-[5%] -translate-x-1/2">
															<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-lg">
																Q
															</div>
														</div>
													</div>

													{/* CENTER */}

													<div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-surface shadow-sm">
														<div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
													</div>
												</div>
											</div>

											{/* HEADING */}

											<div className="mt-5 text-center">
												<p className="text-sm text-muted">
													Current
													heading
												</p>

												<p className="mt-1 text-3xl font-semibold">
													{Math.round(
														heading
													)}
													°
												</p>

												<p className="mt-1 text-sm text-muted">
													{getCardinalDirection(
														heading
													)}
												</p>
											</div>

											{/* INSTRUCTION */}

											<div className="mt-4 max-w-md text-center">
												{compassSupported ? (
													<p className="text-sm leading-6 text-muted">
														Slowly
														rotate
														your
														phone
														until
														the
														Qibla
														marker
														aligns
														with
														the
														indicator
														at
														the
														top.
													</p>
												) : (
													<p className="text-sm leading-6 text-muted">
														Your
														device
														does
														not
														provide
														compass
														orientation
														data.
														Open
														Mīqāt
														on
														a
														phone
														to
														use
														the
														live
														compass.
													</p>
												)}
											</div>
										</div>
									</div>

									{/* INFORMATION */}

									<div className="space-y-4">
										<div className="rounded-2xl border border-border bg-surface p-5">
											<p className="text-sm text-muted">
												Qibla
												direction
											</p>

											<p className="mt-1.5 text-3xl font-semibold">
												{Math.round(
													qiblaDirection
												)}
												°
											</p>

											<p className="mt-1 text-sm text-muted">
												{getCardinalDirection(
													qiblaDirection
												)}
											</p>
										</div>

										<div className="rounded-2xl border border-border bg-surface p-5">
											<p className="text-sm text-muted">
												Your
												direction
											</p>

											<p className="mt-1.5 text-3xl font-semibold">
												{Math.round(
													difference
												)}
												°
											</p>

											<p className="mt-1 text-sm text-muted">
												away from
												Qibla
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
													: "Rotate slowly until the Qibla marker reaches the indicator."}
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
												).toFixed(
													4
												)}
												°,{" "}
												{Number(
													longitude
												).toFixed(
													4
												)}
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
												Change
												location
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