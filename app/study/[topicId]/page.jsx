"use client";

import Sidebar from "../../components/Sidebar";
import ThemeToggle from "../../components/ThemeToggle";

import {
	useEffect,
	useState,
} from "react";

import {
	onAuthStateChanged,
} from "firebase/auth";

import {
	auth,
} from "../../../lib/firebase";

import {
	getStudyTopic,
	getStudyMaterials,
	createStudyMaterial,
	deleteStudyMaterial,
} from "../../../lib/firestore";

export default function StudyTopic({
	params,
}) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const [topic, setTopic] = useState(null);
	const [topicLoading, setTopicLoading] =
		useState(true);

	const [materials, setMaterials] = useState([]);
	const [materialsLoading, setMaterialsLoading] =
		useState(true);

	const [showAddMaterial, setShowAddMaterial] =
		useState(false);

	const [selectedFile, setSelectedFile] =
		useState(null);

	const [materialName, setMaterialName] =
		useState("");

	const [deletingMaterialId, setDeletingMaterialId] =
		useState(null);

	const [addingMaterial, setAddingMaterial] =
		useState(false);

	const [error, setError] = useState("");

	useEffect(() => {
		const unsubscribe =
			onAuthStateChanged(
				auth,
				async (currentUser) => {
					setUser(currentUser);
					setLoading(false);

					if (!currentUser) {
						setTopic(null);
						setTopicLoading(false);
						setMaterials([]);
						setMaterialsLoading(false);
						return;
					}

					try {
						setTopicLoading(true);
						setMaterialsLoading(true);
						setError("");

						const topicId =
							(await params).topicId;

						const loadedTopic =
							await getStudyTopic(
								currentUser.uid,
								topicId
							);

						const loadedMaterials =
							await getStudyMaterials(
								currentUser.uid,
								topicId
							);

						setTopic(
							loadedTopic
						);

						setMaterials(
							loadedMaterials
						);

						console.log(
							"STUDY MATERIALS:",
							loadedMaterials
						);
					} catch (error) {
						console.error(
							"Error loading study topic:",
							error
						);

						setError(
							"Unable to load this study topic."
						);
					} finally {
						setTopicLoading(false);
						setMaterialsLoading(false);
					}
				}
			);

		return () => unsubscribe();
	}, [params]);

	const handleFileChange = (
		event
	) => {
		const file =
			event.target.files?.[0];

		if (!file) {
			setSelectedFile(null);
			return;
		}

		if (
			file.type !==
				"application/pdf" &&
			!file.name
				.toLowerCase()
				.endsWith(".pdf")
		) {
			setError(
				"Only PDF files can be added."
			);

			event.target.value = "";
			setSelectedFile(null);
			return;
		}

		setError("");
		setSelectedFile(file);

		if (!materialName.trim()) {
			const fileName =
				file.name.replace(
					/\.pdf$/i,
					""
				);

			setMaterialName(
				fileName
			);
		}
	};

	const handleAddMaterial = async (
		event
	) => {
		event.preventDefault();

		if (!user || !topic) {
			return;
		}

		if (!selectedFile) {
			setError(
				"Please select a PDF file."
			);
			return;
		}

		const trimmedName =
			materialName.trim();

		if (!trimmedName) {
			setError(
				"Please enter a material name."
			);
			return;
		}

		try {
			setError("");
			setAddingMaterial(true);

			const formData =
				new FormData();

			formData.append(
				"file",
				selectedFile
			);

			formData.append(
				"userId",
				user.uid
			);

			formData.append(
				"topicId",
				topic.id
			);

			const uploadResponse =
				await fetch(
					"/api/study/upload",
					{
						method: "POST",
						body: formData,
					}
				);

			const uploadResult =
				await uploadResponse.json();

			if (!uploadResponse.ok) {
				throw new Error(
					uploadResult.error ||
						"Unable to upload the PDF."
				);
			}

			const newMaterial =
				await createStudyMaterial(
					user.uid,
					topic.id,
					{
						name: trimmedName,
						type: "pdf",
						size: selectedFile.size,
						fileName:
							selectedFile.name,
						filePath:
							uploadResult.filePath,
					}
				);

			setMaterials(
				(currentMaterials) => [
					newMaterial,
					...currentMaterials,
				]
			);

			setMaterialName("");
			setSelectedFile(null);
			setShowAddMaterial(false);
		} catch (error) {
			console.error(
				"Error creating study material:",
				error
			);

			setError(
				error.message ||
					"Unable to add this material. Please try again."
			);
		} finally {
			setAddingMaterial(false);
		}
	};

	const handleOpenMaterial = async (
		material
	) => {
		if (!material?.filePath) {
			setError(
				"This material does not have a stored PDF."
			);
			return;
		}

		try {
			setError("");

			const response =
				await fetch(
					"/api/study/material/url",
					{
						method: "POST",
						headers: {
							"Content-Type":
								"application/json",
						},
						body: JSON.stringify({
							filePath:
								material.filePath,
						}),
					}
				);

			const result =
				await response.json();

			if (!response.ok) {
				throw new Error(
					result.error ||
						"Unable to open this PDF."
				);
			}

			window.open(
				result.url,
				"_blank",
				"noopener,noreferrer"
			);
		} catch (error) {
			console.error(
				"Error opening material:",
				error
			);

			setError(
				error.message ||
					"Unable to open this PDF."
			);
		}
	};

	const handleDeleteMaterial = async (
		materialId
	) => {
		if (!user || !topic) {
			return;
		}

		const material =
			materials.find(
				(item) =>
					item.id ===
					materialId
			);

		if (!material) {
			return;
		}

		const confirmed =
			window.confirm(
				"Are you sure you want to delete this material?"
			);

		if (!confirmed) {
			return;
		}

		try {
			setError("");
			setDeletingMaterialId(
				materialId
			);

			if (material.filePath) {
				const response =
					await fetch(
						"/api/study/material/delete",
						{
							method: "POST",
							headers: {
								"Content-Type":
									"application/json",
							},
							body: JSON.stringify({
								filePath:
									material.filePath,
							}),
						}
					);

				const result =
					await response.json();

				if (!response.ok) {
					throw new Error(
						result.error ||
							"Unable to delete the PDF."
					);
				}
			}

			await deleteStudyMaterial(
				user.uid,
				topic.id,
				materialId
			);

			setMaterials(
				(currentMaterials) =>
					currentMaterials.filter(
						(material) =>
							material.id !==
							materialId
					)
			);
		} catch (error) {
			console.error(
				"Error deleting study material:",
				error
			);

			setError(
				error.message ||
					"Unable to delete this material. Please try again."
			);
		} finally {
			setDeletingMaterialId(null);
		}
	};

	const formatFileSize = (
		bytes
	) => {
		if (!bytes) {
			return "";
		}

		const megabytes =
			bytes /
			(1024 * 1024);

		if (megabytes >= 1) {
			return `${megabytes.toFixed(1)} MB`;
		}

		const kilobytes =
			bytes / 1024;

		return `${kilobytes.toFixed(0)} KB`;
	};

	const closeAddMaterial = () => {
		if (addingMaterial) {
			return;
		}

		setShowAddMaterial(false);
		setMaterialName("");
		setSelectedFile(null);
		setError("");
	};

	if (loading || topicLoading) {
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

	if (error && !topic) {
		return (
			<main className="min-h-screen bg-background text-foreground">
				<div className="flex min-h-screen">
					<Sidebar user={user} />

					<div className="min-w-0 flex-1">
						<div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
							<a
								href="/study"
								className="text-sm text-muted transition-colors hover:text-primary"
							>
								← Study
							</a>

							<div className="mt-10 rounded-2xl border border-border bg-surface p-6">
								<h1 className="text-lg font-semibold text-primary">
									Study topic not found
								</h1>

								<p className="mt-2 text-sm leading-6 text-muted">
									{error}
								</p>
							</div>
						</div>
					</div>
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
								<a
									href="/study"
									className="text-sm text-muted transition-colors hover:text-primary"
								>
									← Study
								</a>

								<p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-muted">
									Topic
								</p>

								<h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
									{topic.name}
								</h1>

								<p className="mt-2 max-w-xl text-sm leading-6 text-muted">
									Your materials and study tools will live here.
								</p>
							</div>

							<ThemeToggle />
						</div>

						{error && (
							<div className="mt-6 rounded-xl border border-border bg-soft px-4 py-3 text-sm text-primary">
								{error}
							</div>
						)}

						<section className="mt-12">
							<div className="flex items-center justify-between gap-4">
								<div>
									<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
										Materials
									</h2>

									<p className="mt-2 text-sm text-muted">
										Add the materials you want Wasl to use for studying.
									</p>
								</div>

								<button
									type="button"
									onClick={() =>
										setShowAddMaterial(true)
									}
									className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
								>
									Add Material
								</button>
							</div>

							{materialsLoading ? (
								<div className="mt-5 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
									<div className="mx-auto h-6 w-6 animate-spin rounded-full border-3 border-soft border-t-primary" />

									<p className="mt-4 text-sm text-muted">
										Loading materials...
									</p>
								</div>
							) : materials.length === 0 ? (
								<div className="mt-5 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
									<p className="text-sm text-muted">
										No materials added yet.
									</p>
								</div>
							) : (
								<div className="mt-5 space-y-3">
									{materials.map(
										(material) => (
											<div
												key={
													material.id
												}
												className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5"
											>
												<div className="min-w-0">
													<h3 className="truncate text-sm font-medium text-primary">
														{
															material.name
														}
													</h3>

													<p className="mt-1 text-xs uppercase tracking-wide text-muted">
														PDF
														{material.size
															? ` • ${formatFileSize(
																	material.size
																)}`
															: ""}
													</p>
												</div>

												<div className="flex items-center gap-2">
													<button
														type="button"
														onClick={() =>
															handleOpenMaterial(
																material
															)
														}
														className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-elevated"
													>
														Open PDF
													</button>

													<button
														type="button"
														onClick={() =>
															handleDeleteMaterial(
																material.id
															)
														}
														disabled={
															deletingMaterialId ===
															material.id
														}
														className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
													>
														{deletingMaterialId ===
														material.id
															? "Deleting..."
															: "Delete"}
													</button>
												</div>
											</div>
										)
									)}
								</div>
							)}
						</section>

						<section className="mt-12">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
								Study Modes
							</h2>

							<div className="mt-4 grid gap-4 sm:grid-cols-2">
								<div className="rounded-2xl border border-border bg-surface p-6">
									<h3 className="text-base font-semibold text-primary">
										Study Guide
									</h3>

									<p className="mt-2 text-sm leading-6 text-muted">
										Turn your materials into a structured guide for learning.
									</p>
								</div>

								<div className="rounded-2xl border border-border bg-surface p-6">
									<h3 className="text-base font-semibold text-primary">
										Smart Study
									</h3>

									<p className="mt-2 text-sm leading-6 text-muted">
										Study through adaptive questions based on what you know.
									</p>
								</div>

								<div className="rounded-2xl border border-border bg-surface p-6">
									<h3 className="text-base font-semibold text-primary">
										Flashcards
									</h3>

									<p className="mt-2 text-sm leading-6 text-muted">
										Recall important ideas with generated flashcards.
									</p>
								</div>

								<div className="rounded-2xl border border-border bg-surface p-6">
									<h3 className="text-base font-semibold text-primary">
										Practice Test
									</h3>

									<p className="mt-2 text-sm leading-6 text-muted">
										Test your understanding with objective questions.
									</p>
								</div>
							</div>
						</section>
					</div>
				</div>
			</div>

			{showAddMaterial && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
					<div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-lg font-semibold text-primary">
									Add material
								</h2>

								<p className="mt-1 text-sm leading-6 text-muted">
									Add a PDF to {topic.name}.
								</p>
							</div>

							<button
								type="button"
								onClick={
									closeAddMaterial
								}
								disabled={
									addingMaterial
								}
								className="text-xl leading-none text-muted transition-colors hover:text-primary disabled:opacity-50"
								aria-label="Close"
							>
								×
							</button>
						</div>

						<form
							onSubmit={
								handleAddMaterial
							}
							className="mt-6"
						>
							<label
								htmlFor="material-file"
								className="text-sm font-medium text-primary"
							>
								PDF file
							</label>

							<input
								id="material-file"
								type="file"
								accept="application/pdf,.pdf"
								onChange={
									handleFileChange
								}
								disabled={
									addingMaterial
								}
								className="mt-2 block w-full cursor-pointer rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
							/>

							{selectedFile && (
								<div className="mt-3 rounded-xl bg-elevated px-4 py-3">
									<p className="truncate text-sm font-medium text-primary">
										{
											selectedFile.name
										}
									</p>

									<p className="mt-1 text-xs text-muted">
										{formatFileSize(
											selectedFile.size
										)}
									</p>
								</div>
							)}

							<label
								htmlFor="material-name"
								className="mt-5 block text-sm font-medium text-primary"
							>
								Material name
							</label>

							<input
								id="material-name"
								type="text"
								value={
									materialName
								}
								onChange={(
									event
								) =>
									setMaterialName(
										event.target.value
									)
								}
								placeholder="e.g. Cell Biology"
								disabled={
									addingMaterial
								}
								className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary disabled:opacity-50"
							/>

							<p className="mt-3 text-xs leading-5 text-muted">
								The PDF will be uploaded to your study library.
							</p>

							<div className="mt-6 flex justify-end gap-3">
								<button
									type="button"
									onClick={
										closeAddMaterial
									}
									disabled={
										addingMaterial
									}
									className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-elevated hover:text-primary disabled:opacity-50"
								>
									Cancel
								</button>

								<button
									type="submit"
									disabled={
										addingMaterial
									}
									className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{addingMaterial
										? "Adding..."
										: "Add Material"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</main>
	);
}