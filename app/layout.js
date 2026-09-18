import "./globals.css";

export const metadata = {
	title: "Wasl",
	description: "Your Muslim companion.",
	manifest: "/manifest.webmanifest",
	themeColor: "#0F4D3A",
	icons: {
		icon: "/icons/icon-192.png",
		apple: "/icons/icon-192.png",
	},
};

export default function RootLayout({children}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function () {
								const textSize =
									localStorage.getItem("wasl_text_size") ||
									"default";

								document.documentElement.classList.add(
									"text-" + textSize
								);
							})();
						`,
					}}
				/>
			</head>

			<body>{children}</body>
		</html>
	);
}