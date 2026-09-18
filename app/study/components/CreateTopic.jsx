"use client";

import { useState } from "react";

export default function CreateTopic({
    onClose,
    onCreate,
}) {
    const [name, setName] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        onCreate({
            name: trimmedName,
        });

        setName("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg">

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-primary">
                            Create a topic
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-muted">
                            Give your study materials a place to live.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl leading-none text-muted transition-colors hover:text-primary"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6"
                >
                    <label
                        htmlFor="topic-name"
                        className="text-sm font-medium text-primary"
                    >
                        Topic name
                    </label>

                    <input
                        id="topic-name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="e.g. Chemistry"
                        autoFocus
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
                    />

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-elevated hover:text-primary"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                        >
                            Create Topic
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}