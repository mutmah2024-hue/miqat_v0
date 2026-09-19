"use client";

import {useState} from "react";

import Link from "next/link";
import {usePathname} from "next/navigation";

const mainNavigation = [
	{
		name: "Dashboard",
		href: "../dashboard",
		icon: "⌂",
	},
	{
		name: "Prayer",
		href: "../prayer",
		icon: "🕘",
	},
	{
		name: "Qur'an",
		href: "../quran",
		icon: "📖",
	},
	{
		name: "Focus",
		href: "../focus",
		icon: "🔒",
	},
	{
		name: "Reflection",
		href: "../reflection",
		icon: "✍🏻",
	},
	{
		name: "Study",
		href: "../study",
		icon: "📚"
	}
];

const toolsNavigation = [
	{
		name: "Qibla",
		href: "../qibla",
		icon: "🧭",
	},
	{
		name: "Tasbih",
		href: "../tasbih",
		icon: "◉",
	},
	{
		name: "Calendar",
		href: "../calendar",
		icon: "☾",
	},
	{
		name: "Adhkār",
		href: "../duas",
		icon: "📿",
	}
];

export default function Sidebar({user}) {
	const pathname = usePathname();

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const firstName = user?.displayName?.trim().split(" ")[0] || "Account";

	const initial = firstName.charAt(0).toUpperCase();

	return (
		<>
			{/* Desktop Sidebar */}

			<aside className="sticky top-0 hidden h-screen max-h-screen w-64 shrink-0 overflow-y-auto border-r border-border bg-surface lg:flex lg:flex-col">
				{/* Logo */}

				<div className="flex h-20 shrink-0 items-center px-7">
					<Link
						href="/dashboard"
						className="text-sm font-semibold tracking-[0.35em] text-primary"
					>
						Wasl
					</Link>
				</div>

				{/* Navigation */}

				<div className="flex-1 px-4 py-6">
					<p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
						Main
					</p>

					<nav className="mt-3 space-y-1">
						{mainNavigation.map((item) => {
							const isActive = pathname === item.href;

							return (
								<Link
									key={item.href}
									href={item.href}
									className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
										isActive
											? "bg-soft text-primary"
											: "text-muted hover:bg-elevated hover:text-primary"
									}`}
								>
									<span className="flex h-7 w-7 items-center justify-center text-base">
										{item.icon}
									</span>

									<span>{item.name}</span>
								</Link>
							);
						})}
					</nav>

					<p className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
						Tools
					</p>

					<nav className="mt-3 space-y-1">
						{toolsNavigation.map((item) => {
							const isActive = pathname === item.href;

							return (
								<Link
									key={item.href}
									href={item.href}
									className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
										isActive
											? "bg-soft text-primary"
											: "text-muted hover:bg-elevated hover:text-primary"
									}`}
								>
									<span className="flex h-7 w-7 items-center justify-center text-base">
										{item.icon}
									</span>

									<span>{item.name}</span>
								</Link>
							);
						})}
					</nav>
				</div>

				{/* Bottom */}

				<div className="shrink-0 border-t border-border p-4">
					<Link
						href="/settings"
						className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition-colors hover:bg-elevated hover:text-primary"
					>
						<span className="flex h-7 w-7 items-center justify-center">⚙</span>

						<span>Settings</span>
					</Link>

					<Link
						href="/profile"
						className="mt-2 flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-elevated"
					>
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft text-sm font-semibold text-primary">
							{initial}
						</div>

						<div className="min-w-0">
							<p className="truncate text-sm font-medium text-primary">
								{firstName}
							</p>

							<p className="text-xs text-muted">Account</p>
						</div>
					</Link>
				</div>
			</aside>

			{/* Mobile More Menu */}

			{mobileMenuOpen && (
				<div className="fixed bottom-20 right-4 z-50 w-56 rounded-2xl border border-border bg-surface p-2 shadow-lg lg:hidden">
					<Link
						href="/focus"
						onClick={() => setMobileMenuOpen(false)}
						className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-elevated"
					>
						<span>🔒</span>
						<span>Focus</span>
					</Link>

					<Link
						href="/reflection"
						onClick={() => setMobileMenuOpen(false)}
						className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-elevated"
					>
						<span>✍🏻</span>
						<span>Reflection</span>
					</Link>

					<Link
						href="/qibla"
						onClick={() => setMobileMenuOpen(false)}
						className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-elevated"
					>
						<span>🧭</span>
						<span>Qibla</span>
					</Link>

					<Link
						href="../tasbih"
						onClick={() => setMobileMenuOpen(false)}
						className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-elevated"
					>
						<span>◉</span>
						<span>Tasbih</span>
					</Link>
					<Link
						href="../duas"
						onClick={() => setMobileMenuOpen(false)}
						className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-elevated"
					>
						<span>📿</span>
						<span>Adhkār</span>
					</Link>
					<Link
						href="../study"
						onClick={() => setMobileMenuOpen(false)}
						className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-elevated"
					>
						<span>📚</span>
						<span>Study</span>
					</Link>
					<div className="my-2 border-t border-border" />

					<Link
						href="../settings"
						onClick={() => setMobileMenuOpen(false)}
						className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-elevated hover:text-primary"
					>
						<span>⚙</span>
						<span>Settings</span>
					</Link>

					<Link
						href="../profile"
						onClick={() => setMobileMenuOpen(false)}
						className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-elevated hover:text-primary"
					>
						<div className="flex h-7 w-7 items-center justify-center rounded-full bg-soft text-xs font-semibold text-primary">
							{initial}
						</div>

						<span>Profile</span>
					</Link>
				</div>
			)}

			{/* Mobile Bottom Navigation */}

			<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
				<div className="mx-auto flex h-16 max-w-md items-center justify-around">
					<Link
						href="/dashboard"
						className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium ${
							pathname === "/dashboard" ? "text-primary" : "text-muted"
						}`}
					>
						<span className="text-base">⌂</span>

						<span>Dashboard</span>
					</Link>

					<Link
						href="/prayer"
						className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium ${
							pathname === "/prayer" ? "text-primary" : "text-muted"
						}`}
					>
						<span className="text-base">🕘</span>

						<span>Prayer</span>
					</Link>

					<Link
						href="/calendar"
						className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium ${
							pathname === "/calendar" ? "text-primary" : "text-muted"
						}`}
					>
						<span className="text-base">☾</span>

						<span>Calendar</span>
					</Link>

					<Link
						href="/quran"
						className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium ${
							pathname === "/quran" ? "text-primary" : "text-muted"
						}`}
					>
						<span className="text-base">📖</span>

						<span>Qur'an</span>
					</Link>

					<button
						type="button"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium ${
							mobileMenuOpen ? "text-primary" : "text-muted"
						}`}
					>
						<span className="text-lg leading-none">⋯</span>

						<span>More</span>
					</button>
				</div>
			</nav>
		</>
	);
}
