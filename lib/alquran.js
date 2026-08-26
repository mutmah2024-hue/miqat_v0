
const ALQURAN_BASE_URL = "https://api.alquran.cloud/v1";

/*
 * Get one Mushaf page
 */

export async function getQuranPage(pageNumber) {
	if (!pageNumber || pageNumber < 1 || pageNumber > 604) {
		throw new Error("Qur'an page must be between 1 and 604.");
	}

	const response = await fetch(
		`${ALQURAN_BASE_URL}/page/${pageNumber}/quran-uthmani`,
	);

	if (!response.ok) {
		throw new Error("Unable to fetch Qur'an page.");
	}

	const result = await response.json();

	if (result.code !== 200) {
		throw new Error("Could not return the Qur'an page.");
	}

	return result.data;
}


/*
 * Get one Surah
 */

export async function getQuranSurah(surahNumber) {
	if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
		throw new Error("Qur'an Surah must be between 1 and 114.");
	}

	const response = await fetch(
		`${ALQURAN_BASE_URL}/surah/${surahNumber}/quran-uthmani`,
	);

	if (!response.ok) {
		throw new Error("Unable to fetch Qur'an Surah.");
	}

	const result = await response.json();

	if (result.code !== 200) {
		throw new Error("Could not return the Qur'an Surah.");
	}

	return result.data;
}


/*
 * Get all 114 Surahs
 */

export async function getQuranSurahs() {
	const response = await fetch(
		`${ALQURAN_BASE_URL}/surah`,
	);

	if (!response.ok) {
		throw new Error("Unable to fetch Qur'an Surahs.");
	}

	const result = await response.json();

	if (result.code !== 200) {
		throw new Error("Could not return Qur'an Surahs.");
	}

	return result.data;
}


/*
 * Get a Juz
 */

export async function getQuranJuz(juzNumber) {
	if (!juzNumber || juzNumber < 1 || juzNumber > 30) {
		throw new Error("Qur'an Juz must be between 1 and 30.");
	}

	const response = await fetch(
		`${ALQURAN_BASE_URL}/juz/${juzNumber}/quran-uthmani`,
	);

	if (!response.ok) {
		throw new Error("Unable to fetch Qur'an Juz.");
	}

	const result = await response.json();

	if (result.code !== 200) {
		throw new Error("Could not return the Qur'an Juz.");
	}

	return result.data;
}

