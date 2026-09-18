import {NextResponse} from "next/server";

import {
	supabaseAdmin,
} from "../../../../../lib/supabaseAdmin";

export async function POST(request) {
	try {
		const body = await request.json();

		const filePath = body?.filePath;

		if (!filePath) {
			return NextResponse.json(
				{
					error: "File path is required.",
				},
				{status: 400}
			);
		}

		const {data, error} =
			await supabaseAdmin.storage
				.from("study-materials")
				.createSignedUrl(
					filePath,
					60 * 10
				);

		if (error) {
			console.error(
				"Supabase signed URL error:",
				error
			);

			return NextResponse.json(
				{
					error:
						"Unable to create a PDF link.",
				},
				{status: 500}
			);
		}

		return NextResponse.json({
			success: true,
			url: data.signedUrl,
		});
	} catch (error) {
		console.error(
			"Signed URL route error:",
			error
		);

		return NextResponse.json(
			{
				error:
					"Something went wrong while creating the PDF link.",
			},
			{status: 500}
		);
	}
}