"use client";

import {useEffect, useState} from "react";

import {
	onAuthStateChanged,
	signOut,
} from "firebase/auth";

import {useRouter} from "next/navigation";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

import {auth} from "../../lib/firebase";

export default function Settings() {
	const router = useRouter();

	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [signingOut, setSigningOut] = useState(false);

	const [textSize, setTextSize] = useState("default");

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(
			auth,
			(currentUser) => {
				if (!currentUser) {
					router.replace("../signinup");
					return;
				}

				setUser(currentUser);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, [router]);

	useEffect(() => {
		const savedTextSize =
			localStorage.getItem("wasl_text_size");

		if (
			savedTextSize === "small" ||
			savedTextSize === "default" ||
			savedTextSize === "large"
		) {
			setTextSize(savedTextSize);
		}
	}, []);

const handleTextSizeChange = (size) => {
	setTextSize(size);

	localStorage.setItem(
		"wasl_text_size",
		size
	);

	document.documentElement.classList.remove(
		"text-small",
		"text-default",
		"text-large"
	);

	document.documentElement.classList.add(
		`text-${size}`
	);
};

	const handleSignOut = async () => {
		try {
			setSigningOut(true);

			await signOut(auth);

			router.replace("../signinup");
		} catch (error) {
			console.error(
				"Sign out error:",
				error
			);

			setSigningOut(false);
		}
	};

	if (loading) {
		return (
			<main className="min-h-screen bg-background text-primary">
				<div className="flex min-h-screen">
					<Sidebar user={user} />

					<main className="flex min-h-screen items-center justify-center bg-background">

				<div className="flex flex-col items-center gap-3">

					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

					<p className="text-sm text-muted">
						Loading...
					</p>

				</div>

			</main>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background text-primary">
			<div className="flex min-h-screen">
				<Sidebar user={user} />

				<div className="min-w-0 flex-1">
					<div className="mx-auto max-w-4xl px-6 py-10 pb-24 lg:px-10 lg:py-14 lg:pb-14">

						{/* Header */}

						<div className="mb-10">
							<h1 className="text-2xl font-semibold tracking-tight text-primary">
								Settings
							</h1>

							<p className="mt-2 text-sm text-muted">
								Customize your Wasl experience.
							</p>
						</div>

						{/* Appearance */}

						<section>
							<h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
								Appearance
							</h2>

							<div className="overflow-hidden rounded-2xl border border-border bg-surface">

								{/* Theme */}

								<div className="flex items-center justify-between gap-6 border-b border-border px-5 py-5">
									<div>
										<p className="text-sm font-medium text-primary">
											Theme
										</p>

										<p className="mt-1 text-xs text-muted">
											Change the mood of Wasl.
										</p>
									</div>

									<ThemeToggle />
								</div>

								{/* Text Size */}

								<div className="px-5 py-5">
									<div className="mb-4">
										<p className="text-sm font-medium text-primary">
											Text size
										</p>

										<p className="mt-1 text-xs text-muted">
											Adjust the size of text across Wasl.
										</p>
									</div>

									<div className="grid grid-cols-3 gap-2">
										{[
											{
												value: "small",
												label: "Small",
											},
											{
												value: "default",
												label: "Default",
											},
											{
												value: "large",
												label: "Large",
											},
										].map((option) => (
											<button
												key={option.value}
												type="button"
												onClick={() =>
													handleTextSizeChange(
														option.value
													)
												}
												className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
													textSize === option.value
														? "border-primary bg-soft text-primary"
														: "border-border text-muted hover:bg-elevated hover:text-primary"
												}`}
											>
												{option.label}
											</button>
										))}
									</div>
								</div>
							</div>
						</section>

						{/* Account */}

						<section className="mt-8">
							<h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
								Account
							</h2>

							<div className="overflow-hidden rounded-2xl border border-border bg-surface">

								<button
									type="button"
									onClick={() =>
										router.push("../profile")
									}
									className="flex w-full items-center justify-between px-5 py-5 text-left transition-colors hover:bg-elevated"
								>
									<div>
										<p className="text-sm font-medium text-primary">
											Profile
										</p>

										<p className="mt-1 text-xs text-muted">
											Manage your personal information.
										</p>
									</div>

									<span className="text-muted">
										›
									</span>
								</button>

								<div className="border-t border-border" />

								<button
									type="button"
									onClick={handleSignOut}
									disabled={signingOut}
									className="flex w-full items-center justify-between px-5 py-5 text-left transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-60"
								>
									<div>
										<p className="text-sm font-medium text-primary">
											{signingOut
												? "Signing out..."
												: "Sign out"}
										</p>

										<p className="mt-1 text-xs text-muted">
											Sign out of your Wasl account.
										</p>
									</div>

									<span className="text-muted">
										→
									</span>
								</button>
							</div>
						</section>

						{/* About */}

						<section className="mt-8">
							<h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
								About
							</h2>

							<div className="overflow-hidden rounded-2xl border border-border bg-surface">

								<div className="flex items-center justify-between px-5 py-5">
									<div>
										<p className="text-sm font-medium text-primary">
											Wasl
										</p>

										<p className="mt-1 text-xs text-muted">
											Your Muslim companion.
										</p>
									</div>

									<span className="text-xs text-muted">
										v0.1
									</span>
								</div>

								<div className="border-t border-border" />

								<div className="px-5 py-5">
									<p className="text-sm leading-6 text-muted">
										Wasl is designed to help you stay connected
										to your worship, reflection, focus, and
										daily life.
									</p>
								</div>
							</div>
						</section>

					</div>
				</div>
			</div>
		</main>
	);
}