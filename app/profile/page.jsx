"use client";

import {useEffect, useState} from "react";
import {
	onAuthStateChanged,
	signOut,
	updateProfile,
} from "firebase/auth";
import {useRouter} from "next/navigation";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import {auth} from "../../lib/firebase";

export default function Profile() {
	const router = useRouter();

	const [user, setUser] = useState(null);
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [signingOut, setSigningOut] = useState(false);

	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(
			auth,
			(currentUser) => {
				if (!currentUser) {
					router.replace("/signin");
					return;
				}

				setUser(currentUser);
				setName(currentUser.displayName || "");
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, [router]);

	const handleSave = async () => {
		const trimmedName = name.trim();

		if (!trimmedName) {
			setError("Please enter your name.");
			setMessage("");
			return;
		}

		if (!user) {
			return;
		}

		if (trimmedName === (user.displayName || "")) {
			setMessage("Your name is already up to date.");
			setError("");
			return;
		}

		try {
			setSaving(true);
			setError("");
			setMessage("");

			await updateProfile(user, {
				displayName: trimmedName,
			});

			setUser({
				...auth.currentUser,
			});

			setMessage("Your name has been updated.");
		} catch (err) {
			console.error("Profile update error:", err);

			setError(
				"Unable to update your name. Please try again."
			);
		} finally {
			setSaving(false);
		}
	};

	const handleSignOut = async () => {
		try {
			setSigningOut(true);
			setError("");

			await signOut(auth);

			router.replace("../signinup");
		} catch (err) {
			console.error("Sign out error:", err);

			setError(
				"Unable to sign out. Please try again."
			);

			setSigningOut(false);
		}
	};

	if (loading) {
		return (
			<main className="min-h-screen bg-background text-primary">
				<div className="flex min-h-screen">
					<Sidebar user={user} />

					<div className="min-w-0 flex-1">
						<div className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
							<div className="h-8 w-32 animate-pulse rounded-lg bg-soft" />

							<div className="mt-2 h-4 w-56 animate-pulse rounded bg-soft" />

							<div className="mt-8 h-32 animate-pulse rounded-3xl bg-soft" />
						</div>
					</div>
				</div>
			</main>
		);
	}

	const displayName =
		user?.displayName?.trim() || "Account";

	const initial =
		displayName.charAt(0).toUpperCase() || "A";

	return (
		<main className="min-h-screen bg-background text-primary">
			<div className="flex min-h-screen">
				<Sidebar user={user} />

				<div className="min-w-0 flex-1">
					<div className="mx-auto max-w-4xl px-6 py-10 pb-24 lg:px-10 lg:py-14 lg:pb-14">
						{/* Header */}

						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm text-muted">
									Account
								</p>

								<h1 className="mt-1 text-3xl font-semibold tracking-tight">
									Profile
								</h1>

								<p className="mt-1 text-sm text-muted">
									Manage your account information.
								</p>
							</div>

							<ThemeToggle />
						</div>

						{/* Profile overview */}

						<section className="mt-7 rounded-3xl border border-border bg-surface p-6">
							<div className="flex items-center gap-4">
								<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-soft text-xl font-semibold text-primary">
									{initial}
								</div>

								<div className="min-w-0">
									<h2 className="truncate text-lg font-semibold">
										{displayName}
									</h2>

									<p className="mt-1 truncate text-sm text-muted">
										{user?.email}
									</p>
								</div>
							</div>
						</section>

						{/* Personal information */}

						<section className="mt-5 rounded-3xl border border-border bg-surface p-6">
							<div>
								<h2 className="text-lg font-semibold">
									Personal information
								</h2>

								<p className="mt-1 text-sm text-muted">
									Update the name associated with
									your account.
								</p>
							</div>

							<div className="mt-6">
								<label
									htmlFor="name"
									className="mb-2 block text-sm font-medium"
								>
									Name
								</label>

								<input
									id="name"
									type="text"
									value={name}
									onChange={(event) => {
										setName(event.target.value);
										setMessage("");
										setError("");
									}}
									placeholder="Enter your name"
									className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-primary"
								/>
							</div>

							{error && (
								<p className="mt-3 text-sm text-red-600">
									{error}
								</p>
							)}

							{message && (
								<p className="mt-3 text-sm text-primary">
									{message}
								</p>
							)}

							<button
								type="button"
								onClick={handleSave}
								disabled={saving}
								className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{saving
									? "Saving..."
									: "Save changes"}
							</button>
						</section>

						{/* Account information */}

						<section className="mt-5 rounded-3xl border border-border bg-surface p-6">
							<div>
								<h2 className="text-lg font-semibold">
									Account
								</h2>

								<p className="mt-1 text-sm text-muted">
									Your account information and
									sign-in details.
								</p>
							</div>

							<div className="mt-5 rounded-2xl border border-border bg-background p-4">
								<p className="text-xs text-muted">
									Email
								</p>

								<p className="mt-1 break-all text-sm font-medium">
									{user?.email}
								</p>
							</div>

							<button
								type="button"
								onClick={handleSignOut}
								disabled={signingOut}
								className="mt-5 rounded-xl border border-border px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
							>
								{signingOut
									? "Signing out..."
									: "Sign out"}
							</button>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}