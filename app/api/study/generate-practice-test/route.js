import { NextResponse } from "next/server";

import {
	supabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
	Mistral,
} from "@mistralai/mistralai";

export async function POST(request) {
	try {
		const body = await request.json();

		const filePath = body?.filePath;
		const materialName = body?.materialName;
		const topicName = body?.topicName;

		if (!filePath) {
			return NextResponse.json(
				{
					error:
						"File path is required.",
				},
				{ status: 400 }
			);
		}

		if (!process.env.MISTRAL_API_KEY) {
			return NextResponse.json(
				{
					error:
						"MISTRAL_API_KEY is missing.",
				},
				{ status: 500 }
			);
		}

		const {
			data: signedUrlData,
			error: signedUrlError,
		} =
			await supabaseAdmin.storage
				.from("study-materials")
				.createSignedUrl(
					filePath,
					60 * 10
				);

		if (signedUrlError) {
			console.error(
				"Supabase signed URL error:",
				signedUrlError
			);

			return NextResponse.json(
				{
					error:
						"Unable to access the study PDF.",
				},
				{ status: 500 }
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
						role: "system",
						content:
							"You are Wasl Study AI. Your job is to create accurate, useful practice tests from educational material. Use only information supported by the provided document. Do not invent facts. Focus on important information that helps a student test their understanding and prepare for exams.",
					},

					{
						role: "user",

						content: [
							{
								type: "text",

								text: `
Create a comprehensive practice test from this educational material.

Topic:
${topicName || "Unknown topic"}

Material:
${materialName || "Study material"}

Return ONLY a valid JSON object with this exact structure:

{
  "practiceTest": {
    "questions": [
      {
        "question": "string",
        "options": [
          "string",
          "string",
          "string",
          "string"
        ],
        "correctAnswer": "string",
        "explanation": "string"
      }
    ]
  }
}

Requirements:

1. Base every question strictly on the provided document.
2. Test important information from the material, not random or trivial details.
3. Cover important definitions, facts, processes, functions, classifications, differences, formulas, relationships, examples, and exceptions when they are present.
4. Make every question clear and specific.
5. Each question must have exactly four answer options.
6. Only one option should be correct.
7. The correctAnswer value must exactly match one of the four options.
8. Make incorrect options plausible but clearly incorrect according to the document.
9. Include questions that test understanding, not only simple memorization.
10. Avoid duplicate or nearly identical questions.
11. Include important exam-relevant details.
12. Do not add information that is not supported by the material.
13. Do not create vague questions.
14. Keep explanations clear and useful. Explain why the correct answer is correct based on the material.
15. Create enough questions to cover the important material comprehensively.
16. Preserve important technical terminology from the document.
17. Return JSON only.
`,
							},

							{
								type: "document_url",
								documentUrl:
									signedUrlData.signedUrl,
							},
						],
					},
				],

				responseFormat: {
					type: "json_object",
				},
			});

		const content =
			response.choices?.[0]?.message
				?.content;

		if (!content) {
			throw new Error(
				"No Practice Test was returned."
			);
		}

		let practiceTest;

		try {
			practiceTest =
				JSON.parse(content);
		} catch (parseError) {
			console.error(
				"Practice Test JSON parse error:",
				parseError
			);

			console.error(
				"Raw Mistral content:",
				content
			);

			throw new Error(
				"Wasl AI returned invalid Practice Test data."
			);
		}

		return NextResponse.json({
			success: true,
			practiceTest,
		});
	} catch (error) {
		console.error(
			"Practice Test generation error:",
			error
		);

		return NextResponse.json(
			{
				error:
					error.message ||
					"Unable to generate Practice Test.",
			},
			{ status: 500 }
		);
	}
}

