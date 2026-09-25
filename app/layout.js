import "./globals.css";

export const metadata = {
	title: "Mīqāt",
	description: "Your Muslim companion.",
	manifest: "/manifest.webmanifest",
	icons: {
		icon: "/icons/icon-192.png",
		apple: "/icons/icon-192.png",
	},
};

export const viewport = {
  themeColor: "#09432E",
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
									localStorage.getItem("Mīqāt_text_size") ||
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