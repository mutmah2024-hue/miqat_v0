"use client";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../lib/firebase";

import ReflectionEditor from "./components/ReflectionEditor";
import ReflectionHistory from "./components/ReflectionHistory";

export default function Reflection() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(
			auth,
			(currentUser) => {
				setUser(currentUser);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, []);

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
					<div className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
									Reflection
								</p>

								<h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
									A quiet moment
								</h1>

								<p className="mt-2 max-w-xl text-sm leading-6 text-muted">
									Slow down, put your thoughts into words,
									and make space to reconnect with what matters.
								</p>
							</div>

							<ThemeToggle />
						</div>

						<div className="mt-10">
							<ReflectionEditor user={user} />
						</div>

						<div className="mt-12">
							<ReflectionHistory user={user} />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}