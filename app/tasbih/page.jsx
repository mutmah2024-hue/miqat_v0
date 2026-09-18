"use client";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

import {
	useEffect,
	useMemo,
	useState,
} from "react";

import {
	onAuthStateChanged,
} from "firebase/auth";

import {
	auth,
} from "../../lib/firebase";

import {
	getTasbihProgress,
	saveTasbihProgress,
	getTasbihItems,
	createTasbihItem,
	deleteTasbihItem,
} from "../../lib/firestore";

const BUILT_IN_DHIKR = [
	{
		id: "builtin-subhanallah",
		key: "subhanallah",
		name: "SubhanAllah",
		arabic: "سُبْحَانَ اللهِ",
		transliteration: "SubhanAllāh",
		meaning: "Glory be to Allah",
		type: "dhikr",
		target: 33,
		builtIn: true,
	},

	{
		id: "builtin-alhamdulillah",
		key: "alhamdulillah",
		name: "Alhamdulillah",
		arabic: "الْحَمْدُ لِلَّهِ",
		transliteration: "Alhamdulillāh",
		meaning: "All praise belongs to Allah",
		type: "dhikr",
		target: 33,
		builtIn: true,
	},

	{
		id: "builtin-allahu-akbar",
		key: "allahu_akbar",
		name: "Allahu Akbar",
		arabic: "اللهُ أَكْبَرُ",
		transliteration: "Allāhu Akbar",
		meaning: "Allah is the Greatest",
		type: "dhikr",
		target: 33,
		builtIn: true,
	},

	{
		id: "builtin-astaghfirullah",
		key: "astaghfirullah",
		name: "Astaghfirullah",
		arabic: "أَسْتَغْفِرُ اللهَ",
		transliteration: "Astaghfirullāh",
		meaning: "I seek forgiveness from Allah",
		type: "dhikr",
		target: 100,
		builtIn: true,
	},

	{
		id: "builtin-la-ilaha-illallah",
		key: "la_ilaha_illallah",
		name: "La ilaha illallah",
		arabic: "لَا إِلٰهَ إِلَّا اللهُ",
		transliteration: "Lā ilāha illallāh",
		meaning:
			"There is no deity worthy of worship except Allah",
		type: "dhikr",
		target: 100,
		builtIn: true,
	},
];

function getTodayKey() {
	const now = new Date();

	const year = now.getFullYear();

	const month = String(
		now.getMonth() + 1
	).padStart(2, "0");

	const day = String(
		now.getDate()
	).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export default function Tasbih() {
	const [user, setUser] = useState(null);

	const [loading, setLoading] =
		useState(true);

	const [progressLoading, setProgressLoading] =
		useState(true);

	const [itemsLoading, setItemsLoading] =
		useState(true);

	const [counts, setCounts] =
		useState({});

	const [customItems, setCustomItems] =
		useState([]);

	const [selectedId, setSelectedId] =
		useState(
			"builtin-subhanallah"
		);

	const [showCreate, setShowCreate] =
		useState(false);

	const [savingItem, setSavingItem] =
		useState(false);

	const [deletingItemId, setDeletingItemId] =
		useState(null);

	const [error, setError] =
		useState("");

	const [createError, setCreateError] =
		useState("");

	const today = useMemo(
		() => getTodayKey(),
		[]
	);

	const [newItem, setNewItem] =
		useState({
			name: "",
			arabic: "",
			transliteration: "",
			meaning: "",
			type: "dhikr",
			target: 33,
		});

	const allItems = [
		...BUILT_IN_DHIKR,
		...customItems,
	];

	const selectedItem =
		allItems.find(
			(item) =>
				item.id === selectedId
		) || BUILT_IN_DHIKR[0];

	const currentCount = Number(
		counts[selectedId] || 0
	);

	const currentTarget =
		Number(
			selectedItem.target || 33
		);

	const dailyTotal =
		Object.values(counts).reduce(
			(sum, count) =>
				sum + Number(count || 0),
			0
		);

	const progress =
		currentTarget > 0
			? Math.min(
					(currentCount /
						currentTarget) *
						100,
					100
				)
			: 0;

	useEffect(() => {
		const unsubscribe =
			onAuthStateChanged(
				auth,
				async (currentUser) => {
					setUser(
						currentUser
					);
					setLoading(false);

					if (!currentUser) {
						setCounts({});
						setCustomItems([]);
						setProgressLoading(
							false
						);
						setItemsLoading(
							false
						);
						return;
					}

					try {
						setError("");
						setProgressLoading(
							true
						);
						setItemsLoading(
							true
						);

						const [
							savedProgress,
							savedItems,
						] = await Promise.all([
							getTasbihProgress(
								currentUser.uid,
								today
							),

							getTasbihItems(
								currentUser.uid
							),
						]);

						setCounts(
							savedProgress.counts ||
								{}
						);

						setCustomItems(
							savedItems || []
						);
					} catch (error) {
						console.error(
							"Error loading Tasbīh data:",
							error
						);

						setError(
							"Unable to load your Tasbīh."
						);
					} finally {
						setProgressLoading(
							false
						);

						setItemsLoading(
							false
						);
					}
				}
			);

		return () =>
			unsubscribe();
	}, [today]);

	useEffect(() => {
		if (
			!user ||
			progressLoading
		) {
			return;
		}

		const timeout =
			setTimeout(
				async () => {
					try {
						await saveTasbihProgress(
							user.uid,
							today,
							counts
						);
					} catch (error) {
						console.error(
							"Error saving Tasbīh progress:",
							error
						);
					}
				},
				800
			);

		return () =>
			clearTimeout(timeout);
	}, [
		counts,
		user,
		today,
		progressLoading,
	]);

	const handleCount = () => {
		setError("");

		setCounts(
			(currentCounts) => ({
				...currentCounts,

				[selectedId]:
					Number(
						currentCounts[
							selectedId
						] || 0
					) + 1,
			})
		);
	};

	const handleReset = () => {
		const confirmed =
			window.confirm(
				"Reset this dhikr count?"
			);

		if (!confirmed) {
			return;
		}

		setCounts(
			(currentCounts) => ({
				...currentCounts,
				[selectedId]: 0,
			})
		);
	};

	const openCreateModal = () => {
		setCreateError("");

		setNewItem({
			name: "",
			arabic: "",
			transliteration: "",
			meaning: "",
			type: "dhikr",
			target: 33,
		});

		setShowCreate(true);
	};

	const closeCreateModal = () => {
		if (savingItem) {
			return;
		}

		setShowCreate(false);
		setCreateError("");
	};

	const handleCreateItem = async (
		event
	) => {
		event.preventDefault();

		if (!user) {
			return;
		}

		const trimmedName =
			newItem.name.trim();

		if (!trimmedName) {
			setCreateError(
				"Please enter a name."
			);
			return;
		}

		const target =
			Number(newItem.target);

		if (
			!Number.isFinite(target) ||
			target < 1
		) {
			setCreateError(
				"Please enter a valid target."
			);
			return;
		}

		try {
			setCreateError("");
			setSavingItem(true);

			const createdItem =
				await createTasbihItem(
					user.uid,
					{
						name: trimmedName,
						arabic:
							newItem.arabic,
						transliteration:
							newItem.transliteration,
						meaning:
							newItem.meaning,
						type:
							newItem.type,
						target,
					}
				);

			setCustomItems(
				(currentItems) => [
					createdItem,
					...currentItems,
				]
			);

			setSelectedId(
				createdItem.id
			);

			setShowCreate(false);
		} catch (error) {
			console.error(
				"Error creating Tasbīh item:",
				error
			);

			setCreateError(
				error.message ||
					"Unable to create this item."
			);
		} finally {
			setSavingItem(false);
		}
	};

	const handleDeleteItem =
		async (itemId) => {
			if (!user) {
				return;
			}

			const item =
				customItems.find(
					(currentItem) =>
						currentItem.id ===
						itemId
				);

			if (!item) {
				return;
			}

			const confirmed =
				window.confirm(
					`Delete "${item.name}"?`
				);

			if (!confirmed) {
				return;
			}

			try {
				setError("");
				setDeletingItemId(
					itemId
				);

				await deleteTasbihItem(
					user.uid,
					itemId
				);

				setCustomItems(
					(currentItems) =>
						currentItems.filter(
							(currentItem) =>
								currentItem.id !==
								itemId
						)
				);

				setCounts(
					(currentCounts) => {
						const nextCounts = {
							...currentCounts,
						};

						delete nextCounts[
							itemId
						];

						return nextCounts;
					}
				);

				if (
					selectedId === itemId
				) {
					setSelectedId(
						BUILT_IN_DHIKR[0].id
					);
				}
			} catch (error) {
				console.error(
					"Error deleting Tasbīh item:",
					error
				);

				setError(
					error.message ||
						"Unable to delete this item."
				);
			} finally {
				setDeletingItemId(
					null
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

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="flex min-h-screen">
				<Sidebar user={user} />

				<div className="min-w-0 flex-1">
					<div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
						<div className="flex items-start justify-between gap-6">
							<div>
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
									Dhikr
								</p>

								<h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
									Tasbīh
								</h1>

								<p className="mt-2 max-w-xl text-sm leading-6 text-muted">
									Count your dhikr and keep your
									own adhkār and duʿās close.
								</p>
							</div>

							<ThemeToggle />
						</div>

						{error && (
							<div className="mt-6 rounded-xl border border-border bg-soft px-4 py-3 text-sm text-primary">
								{error}
							</div>
						)}

						{progressLoading ||
						itemsLoading ? (
							<div className="mt-12 rounded-3xl border border-border bg-surface px-6 py-16 text-center">
								<div className="mx-auto h-7 w-7 animate-spin rounded-full border-3 border-soft border-t-primary" />

								<p className="mt-4 text-sm text-muted">
									Loading your dhikr...
								</p>
							</div>
						) : (
							<>
								<section className="mt-10">
									<div className="flex items-end justify-between gap-4">
										<div>
											<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
												Built-in adhkār
											</h2>

											<p className="mt-2 text-sm text-muted">
												Choose a dhikr to start counting.
											</p>
										</div>
									</div>

									<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{BUILT_IN_DHIKR.map(
											(item) => {
												const active =
													item.id ===
													selectedId;

												return (
													<button
														key={
															item.id
														}
														type="button"
														onClick={() =>
															setSelectedId(
																item.id
															)
														}
														className={`rounded-2xl border p-5 text-left transition-colors ${
															active
																? "border-primary bg-soft"
																: "border-border bg-surface hover:bg-elevated"
														}`}
													>
														<p className="text-sm font-medium text-primary">
															{
																item.name
															}
														</p>

														<p
															dir="rtl"
															className="mt-4 text-2xl leading-relaxed text-primary"
														>
															{
																item.arabic
															}
														</p>

														<p className="mt-2 text-xs leading-5 text-muted">
															{
																item.meaning
															}
														</p>
													</button>
												);
											}
										)}
									</div>
								</section>

								<section className="mt-10">
									<div className="flex items-center justify-between gap-4">
										<div>
											<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
												My adhkār & duʿās
											</h2>

											<p className="mt-2 text-sm text-muted">
												Add your own and count them too.
											</p>
										</div>

										<button
											type="button"
											onClick={
												openCreateModal
											}
											className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
										>
											Add your own
										</button>
									</div>

									{customItems.length ===
									0 ? (
										<div className="mt-4 rounded-2xl border border-dashed border-border bg-surface px-6 py-8 text-center">
											<p className="text-sm text-muted">
												You haven't added any yet.
											</p>
										</div>
									) : (
										<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
											{customItems.map(
												(item) => {
													const active =
														item.id ===
														selectedId;

													return (
														<div
															key={
																item.id
															}
															className={`rounded-2xl border p-5 transition-colors ${
																active
																	? "border-primary bg-soft"
																	: "border-border bg-surface"
															}`}
														>
															<button
																type="button"
																onClick={() =>
																	setSelectedId(
																		item.id
																	)
																}
																className="w-full text-left"
															>
																<div className="flex items-center justify-between gap-3">
																	<p className="text-sm font-medium text-primary">
																		{
																			item.name
																		}
																	</p>

																	<span className="rounded-full bg-background px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted">
																		{
																			item.type
																		}
																	</span>
																</div>

																{item.arabic && (
																	<p
																		dir="rtl"
																		className="mt-4 text-2xl leading-relaxed text-primary"
																	>
																		{
																			item.arabic
																		}
																	</p>
																)}

																{item.meaning && (
																	<p className="mt-2 text-xs leading-5 text-muted">
																		{
																			item.meaning
																		}
																	</p>
																)}

																<p className="mt-4 text-xs text-muted">
																	{
																		Number(
																			counts[
																				item.id
																			] || 0
																		)
																	}{" "}
																	/{" "}
																	{
																		item.target
																	}
																</p>
															</button>

															<button
																type="button"
																onClick={() =>
																	handleDeleteItem(
																		item.id
																	)
																}
																disabled={
																	deletingItemId ===
																	item.id
																}
																className="mt-4 text-xs font-medium text-muted transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
															>
																{deletingItemId ===
																item.id
																	? "Deleting..."
																	: "Delete"}
															</button>
														</div>
													);
												}
											)}
										</div>
									)}
								</section>

								<section className="mt-10 grid gap-5 lg:grid-cols-[1fr_280px]">
									<div className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
										<div className="flex items-start justify-between gap-4">
											<div>
												<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
													{selectedItem.type ===
													"dua"
														? "Duʿā"
														: "Dhikr"}
												</p>

												<h2 className="mt-2 text-xl font-medium text-primary">
													{
														selectedItem.name
													}
												</h2>

												{selectedItem.arabic && (
													<p
														dir="rtl"
														className="mt-5 text-3xl leading-relaxed text-primary sm:text-4xl"
													>
														{
															selectedItem.arabic
														}
													</p>
												)}

												{selectedItem.transliteration && (
													<p className="mt-3 text-sm text-muted">
														{
															selectedItem.transliteration
														}
													</p>
												)}
											</div>

											<button
												type="button"
												onClick={
													handleReset
												}
												className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-elevated hover:text-primary"
											>
												Reset
											</button>
										</div>

										<button
											type="button"
											onClick={
												handleCount
											}
											className="mt-8 flex min-h-[340px] w-full flex-col items-center justify-center rounded-[2rem] border border-border bg-background text-center transition-transform active:scale-[0.99]"
											aria-label={`Count ${selectedItem.name}`}
										>
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
												Tap to count
											</p>

											<p className="mt-6 text-7xl font-semibold tracking-tight text-primary sm:text-8xl">
												{
													currentCount
												}
											</p>

											<p className="mt-3 text-sm text-muted">
												{currentCount >=
												currentTarget
													? "Target reached"
													: `${Math.max(
															currentTarget -
																currentCount,
															0
														)} remaining`}
											</p>
										</button>

										<div className="mt-6">
											<div className="flex items-center justify-between text-xs text-muted">
												<span>
													Progress
												</span>

												<span>
													{currentCount}{" "}
													/{" "}
													{
														currentTarget
													}
												</span>
											</div>

											<div className="mt-2 h-2 overflow-hidden rounded-full bg-soft">
												<div
													className="h-full rounded-full bg-primary transition-all"
													style={{
														width: `${progress}%`,
													}}
												/>
											</div>
										</div>
									</div>

									<div className="space-y-5">
										<div className="rounded-3xl border border-border bg-surface p-6">
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
												Target
											</p>

											<p className="mt-4 text-4xl font-semibold tracking-tight text-primary">
												{
													currentTarget
												}
											</p>

											<p className="mt-2 text-sm leading-6 text-muted">
												Target for this {selectedItem.type ===
												"dua"
													? "duʿā"
													: "dhikr"}
												.
											</p>
										</div>

										<div className="rounded-3xl border border-border bg-surface p-6">
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
												Today
											</p>

											<p className="mt-4 text-4xl font-semibold tracking-tight text-primary">
												{
													dailyTotal
												}
											</p>

											<p className="mt-2 text-sm leading-6 text-muted">
												Total counted today.
											</p>
										</div>
									</div>
								</section>
							</>
						)}
					</div>
				</div>
			</div>

			{showCreate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
					<div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-lg font-semibold text-primary">
									Add adhkār or duʿā
								</h2>

								<p className="mt-1 text-sm leading-6 text-muted">
									Create your own item and use it in the counter.
								</p>
							</div>

							<button
								type="button"
								onClick={
									closeCreateModal
								}
								disabled={
									savingItem
								}
								className="text-xl leading-none text-muted transition-colors hover:text-primary disabled:opacity-50"
								aria-label="Close"
							>
								×
							</button>
						</div>

						<form
							onSubmit={
								handleCreateItem
							}
							className="mt-6 space-y-5"
						>
							<div>
								<label className="text-sm font-medium text-primary">
									Type
								</label>

								<div className="mt-2 grid grid-cols-2 gap-2">
									<button
										type="button"
										onClick={() =>
											setNewItem(
												(current) => ({
													...current,
													type: "dhikr",
												})
											)
										}
										className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
											newItem.type ===
											"dhikr"
												? "border-primary bg-soft text-primary"
												: "border-border text-muted hover:bg-elevated"
										}`}
									>
										Adhkār
									</button>

									<button
										type="button"
										onClick={() =>
											setNewItem(
												(current) => ({
													...current,
													type: "dua",
												})
											)
										}
										className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
											newItem.type ===
											"dua"
												? "border-primary bg-soft text-primary"
												: "border-border text-muted hover:bg-elevated"
										}`}
									>
										Duʿā
									</button>
								</div>
							</div>

							<div>
								<label
									htmlFor="tasbih-name"
									className="text-sm font-medium text-primary"
								>
									Name
								</label>

								<input
									id="tasbih-name"
									type="text"
									value={
										newItem.name
									}
									onChange={(
										event
									) =>
										setNewItem(
											(current) => ({
												...current,
												name:
													event.target
														.value,
											})
										)
									}
									placeholder="e.g. Morning dhikr"
									disabled={
										savingItem
									}
									className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary disabled:opacity-50"
								/>
							</div>

							<div>
								<label
									htmlFor="tasbih-arabic"
									className="text-sm font-medium text-primary"
								>
									Arabic
								</label>

								<textarea
									id="tasbih-arabic"
									value={
										newItem.arabic
									}
									onChange={(
										event
									) =>
										setNewItem(
											(current) => ({
												...current,
												arabic:
													event.target
														.value,
											})
										)
									}
									placeholder="أدخل النص العربي"
									dir="rtl"
									rows={3}
									disabled={
										savingItem
									}
									className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-base leading-8 text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary disabled:opacity-50"
								/>
							</div>

							<div>
								<label
									htmlFor="tasbih-transliteration"
									className="text-sm font-medium text-primary"
								>
									Transliteration
								</label>

								<input
									id="tasbih-transliteration"
									type="text"
									value={
										newItem.transliteration
									}
									onChange={(
										event
									) =>
										setNewItem(
											(current) => ({
												...current,
												transliteration:
													event.target
														.value,
											})
										)
									}
									placeholder="Optional"
									disabled={
										savingItem
									}
									className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary disabled:opacity-50"
								/>
							</div>

							<div>
								<label
									htmlFor="tasbih-meaning"
									className="text-sm font-medium text-primary"
								>
									Meaning
								</label>

								<textarea
									id="tasbih-meaning"
									value={
										newItem.meaning
									}
									onChange={(
										event
									) =>
										setNewItem(
											(current) => ({
												...current,
												meaning:
													event.target
														.value,
											})
										)
									}
									placeholder="Optional"
									rows={3}
									disabled={
										savingItem
									}
									className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary disabled:opacity-50"
								/>
							</div>

							<div>
								<label
									htmlFor="tasbih-target"
									className="text-sm font-medium text-primary"
								>
									Target
								</label>

								<input
									id="tasbih-target"
									type="number"
									min="1"
									value={
										newItem.target
									}
									onChange={(
										event
									) =>
										setNewItem(
											(current) => ({
												...current,
												target:
													event.target
														.value,
											})
										)
									}
									disabled={
										savingItem
									}
									className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
								/>
							</div>

							{createError && (
								<div className="rounded-xl border border-border bg-soft px-4 py-3 text-sm text-primary">
									{
										createError
									}
								</div>
							)}

							<div className="flex justify-end gap-3">
								<button
									type="button"
									onClick={
										closeCreateModal
									}
									disabled={
										savingItem
									}
									className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-elevated hover:text-primary disabled:opacity-50"
								>
									Cancel
								</button>

								<button
									type="submit"
									disabled={
										savingItem
									}
									className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{savingItem
										? "Saving..."
										: "Save"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</main>
	);
}