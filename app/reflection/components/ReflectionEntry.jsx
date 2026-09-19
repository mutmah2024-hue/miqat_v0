"use client";

import { useState } from "react";
import {
	doc,
	updateDoc,
	deleteDoc,
} from "firebase/firestore";

import { db } from "../../../lib/firebase";

export default function ReflectionEntry({ user, reflection }) {
	const [editing, setEditing] = useState(false);
	const [text, setText] = useState(reflection.text);
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		const trimmedText = text.trim();

		if (!trimmedText || saving) {
			return;
		}

		setSaving(true);

		try {
			const reflectionRef = doc(
				db,
				"users",
				user.uid,
				"reflectionEntries",
				reflection.id
			);

			await updateDoc(reflectionRef, {
				text: trimmedText,
			});

			setText(trimmedText);
			setEditing(false);
		} catch (error) {
			console.error("Error updating reflection:", error);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this reflection?"
		);

		if (!confirmed) {
			return;
		}

		try {
			const reflectionRef = doc(
				db,
				"users",
				user.uid,
				"reflectionEntries",
				reflection.id
			);

			await deleteDoc(reflectionRef);
		} catch (error) {
			console.error("Error deleting reflection:", error);
		}
	};

	const formatDate = () => {
		if (!reflection.createdAt) {
			return "Just now";
		}

		return reflection.createdAt
			.toDate()
			.toLocaleString([], {
				dateStyle: "medium",
				timeStyle: "short",
			});
	};

	return (
		<article className="rounded-2xl border border-soft bg-background p-5">
			<div className="flex items-start justify-between gap-4">
				<p className="text-xs text-muted">
					{formatDate()}
				</p>

				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => setEditing(!editing)}
						className="text-xs font-medium text-primary transition-opacity hover:opacity-70"
					>
						{editing ? "Cancel" : "Edit"}
					</button>

					<button
						type="button"
						onClick={handleDelete}
						className="text-xs font-medium text-muted transition-opacity hover:opacity-70"
					>
						Delete
					</button>
				</div>
			</div>

			{reflection.prompt && (
				<p className="mt-4 text-xs font-medium uppercase tracking-[0.15em] text-muted">
					{reflection.prompt}
				</p>
			)}

			{editing ? (
				<div className="mt-4">
					<textarea
						value={text}
						onChange={(event) => setText(event.target.value)}
						rows={6}
						className="w-full resize-none rounded-xl border border-soft bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-primary"
					/>

					<div className="mt-4 flex justify-end">
						<button
							type="button"
							onClick={handleSave}
							disabled={!text.trim() || saving}
							className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{saving ? "Saving..." : "Save changes"}
						</button>
					</div>
				</div>
			) : (
				<p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground">
					{text}
				</p>
			)}
		</article>
	);
}