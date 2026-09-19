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

import { auth } from "../../lib/firebase";

import {
	getTasbihProgress,
	saveTasbihProgress,
	getTasbihItems,
	createTasbihItem,
	updateTasbihItem,
	deleteTasbihItem,
} from "../../lib/firestore";

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

const emptyForm = {
	name: "",
	arabic: "",
	transliteration: "",
	meaning: "",
	type: "dhikr",
	target: 33,
};

export default function Tasbīh() {
	const [user, setUser] = useState(null);

	const [loading, setLoading] =
		useState(true);

	const [itemsLoading, setItemsLoading] =
		useState(true);

	const [progressLoading, setProgressLoading] =
		useState(true);

	const [items, setItems] = useState([]);

	const [counts, setCounts] =
		useState({});

	const [selectedId, setSelectedId] =
		useState(null);

	const [showCreate, setShowCreate] =
		useState(false);

	const [editingItem, setEditingItem] =
		useState(null);

	const [form, setForm] =
		useState(emptyForm);

	const [savingItem, setSavingItem] =
		useState(false);

	const [deletingItemId, setDeletingItemId] =
		useState(null);

	const [error, setError] = useState("");

	const [formError, setFormError] =
		useState("");

	const today = useMemo(
		() => getTodayKey(),
		[]
	);

	const selectedItem =
		items.find(
			(item) =>
				item.id === selectedId
		) || null;

	const currentCount = selectedItem
		? Number(
				counts[selectedItem.id] ||
					0
			)
		: 0;

	const currentTarget = selectedItem
		? Number(
				selectedItem.target || 33
			)
		: 33;

	const progress =
		currentTarget > 0
			? Math.min(
					(currentCount /
						currentTarget) *
						100,
					100
				)
			: 0;

	const dailyTotal =
		Object.values(counts).reduce(
			(sum, count) =>
				sum + Number(count || 0),
			0
		);

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
						setItems([]);
						setCounts({});
						setSelectedId(null);

						setItemsLoading(
							false
						);

						setProgressLoading(
							false
						);

						return;
					}

					try {
						setError("");
						setItemsLoading(
							true
						);
						setProgressLoading(
							true
						);

						const [
							savedItems,
							savedProgress,
						] =
							await Promise.all([
								getTasbihItems(
									currentUser.uid
								),

								getTasbihProgress(
									currentUser.uid,
									today
								),
							]);

						setItems(
							savedItems || []
						);

						setCounts(
							savedProgress.counts ||
								{}
						);

						const savedSelectedId =
							localStorage.getItem(
								"wasl_selected_tasbih"
							);

						const selectedExists =
							savedItems?.some(
								(item) =>
									item.id ===
									savedSelectedId
							);

						if (
							selectedExists
						) {
							setSelectedId(
								savedSelectedId
							);
						} else if (
							savedItems?.length
						) {
							setSelectedId(
								savedItems[0].id
							);
						}
					} catch (error) {
						console.error(
							"Error loading Tasbīh:",
							error
						);

						setError(
							"Unable to load your Tasbīh."
						);
					} finally {
						setItemsLoading(
							false
						);

						setProgressLoading(
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

						setError(
							"Unable to save your Tasbīh progress."
						);
					}
				},
				500
			);

		return () =>
			clearTimeout(timeout);
	}, [
		counts,
		user,
		today,
		progressLoading,
	]);

	const selectItem = (itemId) => {
		setSelectedId(itemId);

		localStorage.setItem(
			"wasl_selected_tasbih",
			itemId
		);
	};

	const increaseCount = () => {
		if (!selectedItem) {
			return;
		}

		setCounts(
			(currentCounts) => ({
				...currentCounts,
				[selectedItem.id]:
					Number(
						currentCounts[
							selectedItem.id
						] || 0
					) + 1,
			})
		);
	};

	const decreaseCount = () => {
		if (!selectedItem) {
			return;
		}

		setCounts(
			(currentCounts) => ({
				...currentCounts,
				[selectedItem.id]:
					Math.max(
						Number(
							currentCounts[
								selectedItem.id
							] || 0
						) - 1,
						0
					),
			})
		);
	};

	const resetCount = () => {
		if (!selectedItem) {
			return;
		}

		setCounts(
			(currentCounts) => ({
				...currentCounts,
				[selectedItem.id]: 0,
			})
		);
	};

	const openCreateModal = () => {
		setForm({
			...emptyForm,
		});

		setFormError("");
		setEditingItem(null);
		setShowCreate(true);
	};

	const openEditModal = (item) => {
		setForm({
			name: item.name || "",
			arabic: item.arabic || "",
			transliteration:
				item.transliteration ||
				"",
			meaning:
				item.meaning || "",
			type:
				item.type || "dhikr",
			target:
				item.target || 33,
		});

		setEditingItem(item);
		setFormError("");
		setShowCreate(true);
	};

	const closeModal = () => {
		if (savingItem) {
			return;
		}

		setShowCreate(false);
		setEditingItem(null);
		setFormError("");
		setForm({
			...emptyForm,
		});
	};

	const updateForm = (
		field,
		value
	) => {
		setForm(
			(currentForm) => ({
				...currentForm,
				[field]: value,
			})
		);
	};

	const handleSaveItem = async (
		event
	) => {
		event.preventDefault();

		if (!user) {
			return;
		}

		const name =
			form.name.trim();

		const target =
			Number(form.target);

		if (!name) {
			setFormError(
				"Please enter a name."
			);
			return;
		}

		if (
			!Number.isFinite(
				target
			) ||
			target < 1
		) {
			setFormError(
				"Please enter a valid target."
			);
			return;
		}

		try {
			setSavingItem(true);
			setFormError("");
			setError("");

			if (editingItem) {
				await updateTasbihItem(
					user.uid,
					editingItem.id,
					{
						name,
						arabic:
							form.arabic.trim(),
						transliteration:
							form.transliteration.trim(),
						meaning:
							form.meaning.trim(),
						type:
							form.type,
						target,
					}
				);

				setItems(
					(currentItems) =>
						currentItems.map(
							(item) =>
								item.id ===
								editingItem.id
									? {
											...item,
											name,
											arabic:
												form.arabic.trim(),
											transliteration:
												form.transliteration.trim(),
											meaning:
												form.meaning.trim(),
											type:
												form.type,
											target,
										}
									: item
						)
				);
			} else {
				const createdItem =
					await createTasbihItem(
						user.uid,
						{
							name,
							arabic:
								form.arabic.trim(),
							transliteration:
								form.transliteration.trim(),
							meaning:
								form.meaning.trim(),
							type:
								form.type,
							target,
						}
					);

				setItems(
					(currentItems) => [
						createdItem,
						...currentItems,
					]
				);

				setSelectedId(
					createdItem.id
				);

				localStorage.setItem(
					"wasl_selected_tasbih",
					createdItem.id
				);
			}

			closeModal();
		} catch (error) {
			console.error(
				"Error saving Tasbīh item:",
				error
			);

			setFormError(
				error.message ||
					"Unable to save this item."
			);
		} finally {
			setSavingItem(false);
		}
	};

	const handleDeleteItem =
		async (item) => {
			if (!user) {
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
					item.id
				);

				await deleteTasbihItem(
					user.uid,
					item.id
				);

				setItems(
					(currentItems) =>
						currentItems.filter(
							(currentItem) =>
								currentItem.id !==
								item.id
						)
				);

				setCounts(
					(currentCounts) => {
						const nextCounts = {
							...currentCounts,
						};

						delete nextCounts[
							item.id
						];

						return nextCounts;
					}
				);

				if (
					selectedId === item.id
				) {
					const remainingItems =
						items.filter(
							(currentItem) =>
								currentItem.id !==
								item.id
						);

					const nextItem =
						remainingItems[0] ||
						null;

					setSelectedId(
						nextItem?.id ||
							null
					);

					if (
						nextItem?.id
					) {
						localStorage.setItem(
							"wasl_selected_tasbih",
							nextItem.id
						);
					} else {
						localStorage.removeItem(
							"wasl_selected_tasbih"
						);
					}
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
					<div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
						<div className="flex items-start justify-between gap-6">
							<div className="min-w-0">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
									Dhikr
								</p>

								<h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
									Tasbīh
								</h1>

								<p className="mt-2 max-w-xl text-sm leading-6 text-muted">
									Keep your adhkār and duʿās close,
									and count them with intention.
								</p>
							</div>

							<ThemeToggle />
						</div>

						{error && (
							<div className="mt-6 rounded-xl border border-border bg-soft px-4 py-3 text-sm text-primary">
								{error}
							</div>
						)}

						{itemsLoading ||
						progressLoading ? (
							<div className="mt-10 rounded-3xl border border-border bg-surface px-6 py-16 text-center">
								<div className="mx-auto h-7 w-7 animate-spin rounded-full border-3 border-soft border-t-primary" />

								<p className="mt-4 text-sm text-muted">
									Loading your Tasbīh...
								</p>
							</div>
						) : items.length === 0 ? (
							<div className="mt-10 rounded-3xl border border-border bg-surface px-6 py-16 text-center">
								<p className="text-sm text-muted">
									You don't have any adhkār or duʿās yet.
								</p>

								<button
									type="button"
									onClick={
										openCreateModal
									}
									className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
								>
									Add your first one
								</button>
							</div>
						) : (
							<>
								{/* Counter */}
								<section className="mt-10 min-w-0 rounded-[2rem] border border-border bg-surface p-4 sm:p-7">
									<div className="flex min-w-0 items-start justify-between gap-4">
										<div className="min-w-0">
											<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
												{
													selectedItem?.type ===
													"dua"
														? "Duʿā"
														: "Dhikr"
												}
											</p>

											<h2 className="mt-2 truncate text-xl font-medium text-primary">
												{
													selectedItem?.name
												}
											</h2>

											{selectedItem?.arabic && (
												<p
													dir="rtl"
													className="mt-5 max-w-full break-words text-3xl leading-relaxed text-primary sm:text-4xl"
												>
													{
														selectedItem.arabic
													}
												</p>
											)}

											{selectedItem?.transliteration && (
												<p className="mt-3 max-w-full break-words text-sm text-muted">
													{
														selectedItem.transliteration
													}
												</p>
											)}
										</div>

										<button
											type="button"
											onClick={
												resetCount
											}
											className="shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-elevated hover:text-primary"
										>
											Reset
										</button>
									</div>

									<div className="mt-8 min-w-0 rounded-[2rem] border border-border bg-background px-4 py-8 text-center sm:px-5">
										<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
											Count
										</p>

										<p className="mt-5 text-7xl font-semibold tracking-tight text-primary sm:text-8xl">
											{
												currentCount
											}
										</p>

										<div className="mt-7 flex items-center justify-center gap-4">
											<button
												type="button"
												onClick={
													decreaseCount
												}
												className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border text-2xl text-primary transition-colors hover:bg-surface"
												aria-label="Decrease count"
											>
												−
											</button>

											<button
												type="button"
												onClick={
													increaseCount
												}
												className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-medium text-white transition-transform active:scale-95"
												aria-label="Increase count"
											>
												+
											</button>
										</div>

										<p className="mt-6 text-sm text-muted">
											{
												currentCount
											}{" "}
											/{" "}
											{
												currentTarget
											}
										</p>

										<div className="mx-auto mt-3 h-2 w-full max-w-xl overflow-hidden rounded-full bg-soft">
											<div
												className="h-full rounded-full bg-primary transition-all"
												style={{
													width: `${progress}%`,
												}}
											/>
										</div>

										<p className="mt-3 text-xs text-muted">
											{currentCount >=
											currentTarget
												? "Target reached"
												: `${Math.max(
														currentTarget -
															currentCount,
														0
													)} remaining`}
										</p>
									</div>

									<div className="mt-5 flex min-w-0 justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-4 sm:px-5">
										<div className="min-w-0">
											<p className="text-xs uppercase tracking-[0.15em] text-muted">
												Today's total
											</p>

											<p className="mt-1 text-xl font-medium text-primary">
												{
													dailyTotal
												}
											</p>
										</div>

										<div className="min-w-0 text-right">
											<p className="text-xs uppercase tracking-[0.15em] text-muted">
												Target
											</p>

											<p className="mt-1 text-xl font-medium text-primary">
												{
													currentTarget
												}
											</p>
										</div>
									</div>
								</section>

								{/* Collection */}
								<section className="mt-10 min-w-0">
									<div className="flex items-end justify-between gap-4">
										<div className="min-w-0">
											<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
												Your collection
											</h2>

											<p className="mt-2 text-sm text-muted">
												Choose what you want to count.
											</p>
										</div>

										<button
											type="button"
											onClick={
												openCreateModal
											}
											className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
										>
											Add new
										</button>
									</div>

									<div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{items.map(
											(item) => {
												const active =
													item.id ===
													selectedId;

												const itemCount =
													Number(
														counts[
															item.id
														] || 0
													);

												return (
													<div
														key={
															item.id
														}
														className={`min-w-0 rounded-2xl border p-4 transition-colors sm:p-5 ${
															active
																? "border-primary bg-soft"
																: "border-border bg-surface"
														}`}
													>
														<button
															type="button"
															onClick={() =>
																selectItem(
																	item.id
																)
															}
															className="block w-full min-w-0 text-left"
														>
															<div className="flex min-w-0 items-center justify-between gap-3">
																<h3 className="min-w-0 truncate text-sm font-medium text-primary">
																	{
																		item.name
																	}
																</h3>

																<span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted">
																	{
																		item.type
																	}
																</span>
															</div>

															{item.arabic && (
																<p
																	dir="rtl"
																	className="mt-4 max-w-full break-words text-xl leading-relaxed text-primary"
																>
																	{
																		item.arabic
																	}
																</p>
															)}

															<div className="mt-4 flex min-w-0 items-center justify-between gap-3">
																<p className="text-xs text-muted">
																	{
																		itemCount
																	}{" "}
																	/{" "}
																	{
																		item.target
																	}
																</p>

																{active && (
																	<span className="shrink-0 text-xs font-medium text-primary">
																		Selected
																	</span>
																)}
															</div>
														</button>

														<div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
															<button
																type="button"
																onClick={() =>
																	openEditModal(
																		item
																	)
																}
																className="text-xs font-medium text-primary transition-opacity hover:opacity-70"
															>
																Edit
															</button>

															<button
																type="button"
																onClick={() =>
																	handleDeleteItem(
																		item
																	)
																}
																disabled={
																	deletingItemId ===
																	item.id
																}
																className="text-xs font-medium text-muted transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
															>
																{deletingItemId ===
																item.id
																	? "Deleting..."
																	: "Delete"}
															</button>
														</div>
													</div>
												);
											}
										)}
									</div>
								</section>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Create / Edit Modal */}
			{showCreate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 sm:px-6">
					<div className="max-h-[90vh] w-full max-w-lg min-w-0 overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-lg sm:p-6">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<h2 className="text-lg font-semibold text-primary">
									{editingItem
										? "Edit adhkār or duʿā"
										: "Add adhkār or duʿā"}
								</h2>

								<p className="mt-1 text-sm leading-6 text-muted">
									{editingItem
										? "Update this item."
										: "Create an item for your Tasbīh collection."}
								</p>
							</div>

							<button
								type="button"
								onClick={
									closeModal
								}
								disabled={
									savingItem
								}
								className="shrink-0 text-xl leading-none text-muted transition-colors hover:text-primary disabled:opacity-50"
								aria-label="Close"
							>
								×
							</button>
						</div>

						<form
							onSubmit={
								handleSaveItem
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
											updateForm(
												"type",
												"dhikr"
											)
										}
										className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
											form.type ===
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
											updateForm(
												"type",
												"dua"
											)
										}
										className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
											form.type ===
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
										form.name
									}
									onChange={(event) =>
										updateForm(
											"name",
											event.target
												.value
										)
									}
									placeholder="e.g. Morning adhkār"
									disabled={
										savingItem
									}
									className="mt-2 w-full min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary disabled:opacity-50"
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
										form.arabic
									}
									onChange={(event) =>
										updateForm(
											"arabic",
											event.target
												.value
										)
									}
									dir="rtl"
									rows={3}
									placeholder="النص العربي"
									disabled={
										savingItem
									}
									className="mt-2 w-full min-w-0 resize-none rounded-xl border border-border bg-background px-4 py-3 text-base leading-8 text-foreground outline-none placeholder:text-muted focus:border-primary disabled:opacity-50"
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
										form.transliteration
									}
									onChange={(event) =>
										updateForm(
											"transliteration",
											event.target
												.value
										)
									}
									placeholder="Optional"
									disabled={
										savingItem
									}
									className="mt-2 w-full min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary disabled:opacity-50"
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
										form.meaning
									}
									onChange={(event) =>
										updateForm(
											"meaning",
											event.target
												.value
										)
									}
									rows={3}
									placeholder="Optional"
									disabled={
										savingItem
									}
									className="mt-2 w-full min-w-0 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary disabled:opacity-50"
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
										form.target
									}
									onChange={(event) =>
										updateForm(
											"target",
											event.target
												.value
										)
									}
									disabled={
										savingItem
									}
									className="mt-2 w-full min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
								/>
							</div>

							{formError && (
								<div className="rounded-xl border border-border bg-soft px-4 py-3 text-sm text-primary">
									{
										formError
									}
								</div>
							)}

							<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
								<button
									type="button"
									onClick={
										closeModal
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
										: editingItem
											? "Save changes"
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