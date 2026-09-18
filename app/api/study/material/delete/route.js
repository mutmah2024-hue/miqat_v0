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

		const {error} =
			await supabaseAdmin.storage
				.from("study-materials")
				.remove([filePath]);

		if (error) {
			console.error(
				"Supabase delete error:",
				error
			);

			return NextResponse.json(
				{
					error:
						"Unable to delete the PDF.",
				},
				{status: 500}
			);
		}

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error(
			"Delete route error:",
			error
		);

		return NextResponse.json(
			{
				error:
					"Something went wrong while deleting the PDF.",
			},
			{status: 500}
		);
	}
}