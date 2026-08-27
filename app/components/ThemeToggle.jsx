"use client";

import {useEffect, useState} from "react";

export default function ThemeToggle() {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");

		if (savedTheme === "dark") {
			document.documentElement.classList.add("dark");
			setDarkMode(true);
		}
	}, []);

	const toggleTheme = () => {
		const nextTheme = !darkMode;

		setDarkMode(nextTheme);

		if (nextTheme) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	};

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label="Toggle theme"
			className=" h-10 w-10 items-center justify-center hover:rounded-xl text-foreground transition-colors hover:bg-elevated"
		>
			{darkMode ? "☀️" : "🌙"}
		</button>
	);
}