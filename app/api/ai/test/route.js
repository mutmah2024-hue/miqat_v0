import { NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

export async function GET() {
	try {
		if (!process.env.MISTRAL_API_KEY) {
			return NextResponse.json(
				{
					error:
						"MISTRAL_API_KEY is missing.",
				},
				{status: 500}
			);
		}

		const mistral = new Mistral({
			apiKey:
				process.env.MISTRAL_API_KEY,
		});

		const response =
			await mistral.chat.complete({
				model: "ministral-8b-2512",
				messages: [
					{
						role: "user",
						content:
							"Explain what an atom is in three simple sentences.",
					},
				],
			});

		const answer =
			response.choices?.[0]?.message
				?.content;

		return NextResponse.json({
			success: true,
			answer:
				answer ||
				"No response was returned.",
		});
	} catch (error) {
		console.error(
			"Mistral test error:",
			error
		);

		return NextResponse.json(
			{
				error:
					error.message ||
					"Unable to connect to Mistral.",
			},
			{status: 500}
		);
	}
}