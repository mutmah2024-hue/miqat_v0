"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../../../lib/firebase";

const prompts = [
	"What am I grateful for today?",
	"What went well today?",
	"What was difficult today?",
	"What do I want to improve tomorrow?",
	"What is weighing on my heart?",
	"What am I turning back to Allah for?",
];

export default function ReflectionEditor({ user }) {
	const [text, setText] = useState("");
	const [selectedPrompt, setSelectedPrompt] = useState("");
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		const trimmedText = text.trim();

		if (!trimmedText || saving) {
			return;
		}

		setSaving(true);

		try {
			const reflectionRef = collection(
				db,
				"users",
				user.uid,
				"reflectionEntries"
			);

			await addDoc(reflectionRef, {
				text: trimmedText,
				prompt: selectedPrompt || null,
				createdAt: serverTimestamp(),
			});

			setText("");
			setSelectedPrompt("");
		} catch (error) {
			console.error("Error saving reflection:", error);
		} finally {
			setSaving(false);
		}
	};

	return (
		<section className="w-full">
			<div className="rounded-2xl border border-soft bg-background p-5 sm:p-6">
				<p className="text-sm font-medium text-primary">
					Take a moment
				</p>

				<h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
					What’s on your mind?
				</h2>

				<div className="mt-5">
					<label
						htmlFor="reflection"
						className="sr-only"
					>
						Write your reflection
					</label>

					<textarea
						id="reflection"
						value={text}
						onChange={(event) => setText(event.target.value)}
						placeholder="Write freely..."
						rows={7}
						className="w-full resize-none rounded-xl border border-soft bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-primary"
					/>
				</div>

				<div className="mt-5">
					<p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
						Reflect on
					</p>

					<div className="mt-3 flex flex-wrap gap-2">
						{prompts.map((prompt) => {
							const isSelected = selectedPrompt === prompt;

							return (
								<button
									key={prompt}
									type="button"
									onClick={() =>
										setSelectedPrompt(
											isSelected ? "" : prompt
										)
									}
									className={`rounded-xl px-3 py-2 text-xs transition ${
										isSelected
											? "bg-primary text-white"
											: "bg-soft text-primary hover:opacity-80"
									}`}
								>
									{prompt}
								</button>
							);
						})}
					</div>
				</div>

				<div className="mt-5 flex justify-end">
					<button
						type="button"
						onClick={handleSave}
						disabled={!text.trim() || saving}
						className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{saving ? "Saving..." : "Save reflection"}
					</button>
				</div>
			</div>
		</section>
	);
}