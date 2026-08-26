const ALADHAN_BASE_URL =
	"https://api.aladhan.com/v1";

export async function getPrayerTimes(
	latitude,
	longitude
) {
	const response = await fetch(
		`${ALADHAN_BASE_URL}/timings?latitude=${latitude}&longitude=${longitude}&method=2`
	);

	if (!response.ok) {
		throw new Error(
			"Unable to fetch prayer times."
		);
	}

	const result = await response.json();

	if (result.code !== 200) {
		throw new Error(
			"AlAdhan could not return prayer times."
		);
	}

	return result.data;
}


/*
 * Get a complete Hijri month.
 *
 * AlAdhan expects:
 *
 * /hijriCalendar/{year}/{month}
 *
 * We use coordinates so the Gregorian
 * dates returned by the API are tied
 * to the selected location.
 */

export async function getHijriMonthCalendar(
	month,
	year
) {
	const response = await fetch(
		`${ALADHAN_BASE_URL}/hijriCalendar/${year}/${month}?latitude=7.3775&longitude=3.9470&method=2`
	);

	if (!response.ok) {
		throw new Error(
			"Unable to fetch Hijri calendar."
		);
	}

	const result = await response.json();

	if (
		result.code !== 200 ||
		!Array.isArray(result.data)
	) {
		throw new Error(
			"AlAdhan could not return the Hijri calendar."
		);
	}

	return result.data;
}


/*
 * Get today's Hijri date directly
 * from AlAdhan.
 */

export async function getTodayHijriDate() {
	const today = new Date();

	const day = String(
		today.getDate()
	).padStart(2, "0");

	const month = String(
		today.getMonth() + 1
	).padStart(2, "0");

	const year = today.getFullYear();

	const response = await fetch(
		`${ALADHAN_BASE_URL}/gToH/${day}-${month}-${year}`
	);

	if (!response.ok) {
		throw new Error(
			"Unable to determine today's Hijri date."
		);
	}

	const result = await response.json();

	if (
		result.code !== 200 ||
		!result.data?.hijri
	) {
		throw new Error(
			"AlAdhan could not determine today's Hijri date."
		);
	}

	return result.data.hijri;
}