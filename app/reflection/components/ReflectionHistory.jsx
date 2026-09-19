"use client";

import { useEffect, useState } from "react";
import {
	collection,
	onSnapshot,
	orderBy,
	query,
} from "firebase/firestore";

import { db } from "../../../lib/firebase";
import ReflectionEntry from "./ReflectionEntry";

export default function ReflectionHistory({ user }) {
	const [reflections, setReflections] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user) {
			setReflections([]);
			setLoading(false);
			return;
		}

		const reflectionsRef = collection(
			db,
			"users",
			user.uid,
			"reflectionEntries"
		);

		const reflectionsQuery = query(
			reflectionsRef,
			orderBy("createdAt", "desc")
		);

		const unsubscribe = onSnapshot(
			reflectionsQuery,
			(snapshot) => {
				const entries = snapshot.docs.map((document) => ({
					id: document.id,
					...document.data(),
				}));

				setReflections(entries);
				setLoading(false);
			},
			(error) => {
				console.error(
					"Error loading reflections:",
					error
				);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, [user]);

	if (loading) {
		return (
			<section className="w-full">
				<p className="text-sm text-muted">
					Loading reflections...
				</p>
			</section>
		);
	}

	return (
		<section className="w-full">
			<div className="mb-5">
				<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
					Your reflections
				</p>

				<h2 className="mt-2 text-2xl font-semibold tracking-tight text-primary">
					Reflection history
				</h2>
			</div>

			{reflections.length === 0 ? (
				<div className="rounded-2xl border border-soft bg-background px-5 py-10 text-center">
					<p className="text-sm text-muted">
						Your reflections will appear here.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{reflections.map((reflection) => (
						<ReflectionEntry
							key={reflection.id}
							user={user}
							reflection={reflection}
						/>
					))}
				</div>
			)}
		</section>
	);
}