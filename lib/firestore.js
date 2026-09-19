import {
	doc,
	getDoc,
	setDoc,
	addDoc,
	getDocs,
	deleteDoc,
	updateDoc,
	collection,
	serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

/*
 * Get today's date using the user's local date.
 */

function getTodayKey() {
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

/*
 * ================================
 * FOCUS
 * ================================
 */

/*
 * Get a user's Focus settings
 */

export async function getFocusSettings(userId) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const userRef = doc(db, "users", userId);

	const snapshot = await getDoc(userRef);

	if (!snapshot.exists()) {
		return null;
	}

	const data = snapshot.data();

	return {
		focusGoal: data.focusGoal ?? 60,
		focusDuration: data.focusDuration ?? 25,
		breakDuration: data.breakDuration ?? 5,
	};
}

/*
 * Save a user's Focus settings
 */

export async function saveFocusSettings(userId, settings) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const userRef = doc(db, "users", userId);

	await setDoc(
		userRef,
		{
			focusGoal: settings.focusGoal,
			focusDuration: settings.focusDuration,
			breakDuration: settings.breakDuration,
		},
		{
			merge: true,
		},
	);
}

/*
 * Get today's Focus statistics
 */

export async function getTodayFocusStats(userId) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const today = getTodayKey();

	const statsRef = doc(
		db,
		"users",
		userId,
		"focusStats",
		today,
	);

	const snapshot = await getDoc(statsRef);

	if (!snapshot.exists()) {
		return {
			sessions: 0,
			focusTime: 0,
		};
	}

	const data = snapshot.data();

	return {
		sessions: data.sessions ?? 0,
		focusTime: data.focusTime ?? 0,
	};
}

/*
 * Save a completed Focus session
 */

export async function saveCompletedFocusSession(
	userId,
	duration,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!duration || duration < 1) {
		throw new Error(
			"Focus duration must be greater than 0.",
		);
	}

	const today = getTodayKey();

	const statsRef = doc(
		db,
		"users",
		userId,
		"focusStats",
		today,
	);

	const snapshot = await getDoc(statsRef);

	const existingData = snapshot.exists()
		? snapshot.data()
		: {};

	const currentSessions =
		existingData.sessions ?? 0;

	const currentFocusTime =
		existingData.focusTime ?? 0;

	const updatedSessions =
		currentSessions + 1;

	const updatedFocusTime =
		currentFocusTime + duration;

	/*
	 * Save individual Focus session
	 */

	const sessionsRef = collection(
		db,
		"users",
		userId,
		"focusSessions",
	);

	await addDoc(sessionsRef, {
		duration: duration,
		date: today,
		completedAt: serverTimestamp(),
	});

	/*
	 * Update today's statistics
	 */

	await setDoc(
		statsRef,
		{
			sessions: updatedSessions,
			focusTime: updatedFocusTime,
			updatedAt: serverTimestamp(),
		},
		{
			merge: true,
		},
	);

	return {
		sessions: updatedSessions,
		focusTime: updatedFocusTime,
	};
}

/*
 * Get a user's Focus history
 */

export async function getFocusHistory(userId) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const sessionsRef = collection(
		db,
		"users",
		userId,
		"focusSessions",
	);

	const snapshot = await getDocs(sessionsRef);

	const sessions = snapshot.docs.map(
		(sessionDoc) => ({
			id: sessionDoc.id,
			...sessionDoc.data(),
		}),
	);

	sessions.sort((a, b) => {
		const aTime =
			a.completedAt?.toMillis?.() ?? 0;

		const bTime =
			b.completedAt?.toMillis?.() ?? 0;

		return bTime - aTime;
	});

	return sessions;
}

/*
 * ================================
 * QUR'AN
 * ================================
 */

/*
 * Get Qur'an settings
 */

export async function getQuranSettings(userId) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const userRef = doc(db, "users", userId);

	const snapshot = await getDoc(userRef);

	if (!snapshot.exists()) {
		return {
			dailyGoal: 5,
			lastPage: 1,
		};
	}

	const data = snapshot.data();

	return {
		dailyGoal: data.quranDailyGoal ?? 5,
		lastPage: data.quranLastPage ?? 1,
	};
}

/*
 * Save Qur'an daily goal
 */

export async function saveQuranDailyGoal(
	userId,
	dailyGoal,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!dailyGoal || dailyGoal < 1) {
		throw new Error(
			"Daily goal must be greater than 0.",
		);
	}

	const userRef = doc(db, "users", userId);

	await setDoc(
		userRef,
		{
			quranDailyGoal: dailyGoal,
		},
		{
			merge: true,
		},
	);
}

/*
 * Get today's Qur'an progress
 */

export async function getTodayQuranProgress(
	userId,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const today = getTodayKey();

	const progressRef = doc(
		db,
		"users",
		userId,
		"quranProgress",
		today,
	);

	const snapshot = await getDoc(progressRef);

	if (!snapshot.exists()) {
		return {
			pagesRead: 0,
		};
	}

	const data = snapshot.data();

	return {
		pagesRead: data.pagesRead ?? 0,
	};
}

/*
 * Save today's Qur'an progress
 */

export async function saveTodayQuranProgress(
	userId,
	pagesRead,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const today = getTodayKey();

	const progressRef = doc(
		db,
		"users",
		userId,
		"quranProgress",
		today,
	);

	await setDoc(
		progressRef,
		{
			pagesRead: pagesRead,
			updatedAt: serverTimestamp(),
		},
		{
			merge: true,
		},
	);
}

/*
 * Save last Qur'an page
 */

export async function saveLastQuranPage(
	userId,
	pageNumber,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const userRef = doc(db, "users", userId);

	await setDoc(
		userRef,
		{
			quranLastPage: pageNumber,
		},
		{
			merge: true,
		},
	);
}

/*
 * ================================
 * SALAH / PRAYER
 * ================================
 */

/*
 * Get today's Salah progress
 *
 * Each prayer is stored separately
 * inside today's document.
 */

export async function getTodayPrayerProgress(
	userId,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const today = getTodayKey();

	const progressRef = doc(
		db,
		"users",
		userId,
		"prayerProgress",
		today,
	);

	const snapshot = await getDoc(progressRef);

	if (!snapshot.exists()) {
		return {
			Fajr: false,
			Dhuhr: false,
			Asr: false,
			Maghrib: false,
			Isha: false,
		};
	}

	const data = snapshot.data();

	return {
		Fajr: data.Fajr ?? false,
		Dhuhr: data.Dhuhr ?? false,
		Asr: data.Asr ?? false,
		Maghrib: data.Maghrib ?? false,
		Isha: data.Isha ?? false,
	};
}

/*
 * Save today's Salah progress
 *
 * IMPORTANT:
 * This function saves the exact value supplied.
 * It does NOT toggle the value.
 */

export async function saveTodayPrayerProgress(
	userId,
	prayer,
	completed,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const validPrayers = [
		"Fajr",
		"Dhuhr",
		"Asr",
		"Maghrib",
		"Isha",
	];

	if (!validPrayers.includes(prayer)) {
		throw new Error("Invalid prayer name.");
	}

	const today = getTodayKey();

	const progressRef = doc(
		db,
		"users",
		userId,
		"prayerProgress",
		today,
	);

	await setDoc(
		progressRef,
		{
			[prayer]: Boolean(completed),
			updatedAt: serverTimestamp(),
		},
		{
			merge: true,
		},
	);
}

/*
 * ================================
 * STUDY
 * ================================
 */

/*
 * Get a user's Study topics
 */

export async function getStudyTopics(userId) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const topicsRef = collection(
		db,
		"users",
		userId,
		"studyTopics",
	);

	const snapshot = await getDocs(topicsRef);

	const topics = snapshot.docs.map(
		(topicDoc) => ({
			id: topicDoc.id,
			...topicDoc.data(),
		}),
	);

	topics.sort((a, b) => {
		const aTime =
			a.createdAt?.toMillis?.() ?? 0;

		const bTime =
			b.createdAt?.toMillis?.() ?? 0;

		return bTime - aTime;
	});

	return topics;
}

/*
 * Create a Study topic
 */

export async function createStudyTopic(
	userId,
	name,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const trimmedName = name?.trim();

	if (!trimmedName) {
		throw new Error("Topic name is required.");
	}

	const topicsRef = collection(
		db,
		"users",
		userId,
		"studyTopics",
	);

	const topicData = {
		name: trimmedName,
		userId: userId,
		createdAt: serverTimestamp(),
	};

	const topicRef = await addDoc(
		topicsRef,
		topicData,
	);

	return {
		id: topicRef.id,
		...topicData,
	};
}

/*
 * Get one Study topic
 */

export async function getStudyTopic(
	userId,
	topicId,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!topicId) {
		throw new Error("Topic ID is required.");
	}

	const topicRef = doc(
		db,
		"users",
		userId,
		"studyTopics",
		topicId,
	);

	const topicSnapshot =
		await getDoc(topicRef);

	if (!topicSnapshot.exists()) {
		throw new Error(
			"Study topic not found.",
		);
	}

	return {
		id: topicSnapshot.id,
		...topicSnapshot.data(),
	};
}

/*
 * ================================
 * STUDY MATERIALS
 * ================================
 */

/*
 * Get materials for a Study topic
 */

export async function getStudyMaterials(
	userId,
	topicId,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!topicId) {
		throw new Error("Topic ID is required.");
	}

	const materialsRef = collection(
		db,
		"users",
		userId,
		"studyTopics",
		topicId,
		"materials",
	);

	const snapshot = await getDocs(
		materialsRef,
	);

	const materials = snapshot.docs.map(
		(materialDoc) => ({
			id: materialDoc.id,
			...materialDoc.data(),
		}),
	);

	materials.sort((a, b) => {
		const aTime =
			a.createdAt?.toMillis?.() ?? 0;

		const bTime =
			b.createdAt?.toMillis?.() ?? 0;

		return bTime - aTime;
	});

	return materials;
}

/*
 * Create a Study material
 */

export async function createStudyMaterial(
	userId,
	topicId,
	material,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!topicId) {
		throw new Error("Topic ID is required.");
	}

	if (!material?.name?.trim()) {
		throw new Error(
			"Material name is required.",
		);
	}

	const materialsRef = collection(
		db,
		"users",
		userId,
		"studyTopics",
		topicId,
		"materials",
	);

	const materialData = {
		name: material.name.trim(),
		type: material.type || "pdf",
		size: material.size || null,
		fileName: material.fileName || null,
		filePath: material.filePath || null,
		studyGuide: null,
		createdAt: serverTimestamp(),
	};

	const materialRef = await addDoc(
		materialsRef,
		materialData,
	);

	return {
		id: materialRef.id,
		...materialData,
	};
}

/*
 * Save a generated Study Guide
 */

export async function saveStudyGuide(
	userId,
	topicId,
	materialId,
	studyGuide,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!topicId) {
		throw new Error("Topic ID is required.");
	}

	if (!materialId) {
		throw new Error(
			"Material ID is required.",
		);
	}

	if (!studyGuide) {
		throw new Error(
			"Study Guide is required.",
		);
	}

	const materialRef = doc(
		db,
		"users",
		userId,
		"studyTopics",
		topicId,
		"materials",
		materialId,
	);

	await updateDoc(materialRef, {
		studyGuide: studyGuide,
		studyGuideCreatedAt:
			serverTimestamp(),
	});
}

/*
 * Save generated Flashcards
 */

export async function saveFlashcards(
	userId,
	topicId,
	materialId,
	flashcards,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!topicId) {
		throw new Error("Topic ID is required.");
	}

	if (!materialId) {
		throw new Error(
			"Material ID is required.",
		);
	}

	if (!flashcards) {
		throw new Error(
			"Flashcards are required.",
		);
	}

	const materialRef = doc(
		db,
		"users",
		userId,
		"studyTopics",
		topicId,
		"materials",
		materialId,
	);

	await updateDoc(materialRef, {
		flashcards: flashcards,
		flashcardsCreatedAt:
			serverTimestamp(),
	});
}

/*
 * Save generated Practice Test
 */

export async function savePracticeTest(
	userId,
	topicId,
	materialId,
	practiceTest,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!topicId) {
		throw new Error("Topic ID is required.");
	}

	if (!materialId) {
		throw new Error(
			"Material ID is required.",
		);
	}

	if (!practiceTest) {
		throw new Error(
			"Practice Test is required.",
		);
	}

	const materialRef = doc(
		db,
		"users",
		userId,
		"studyTopics",
		topicId,
		"materials",
		materialId,
	);

	await updateDoc(materialRef, {
		practiceTest: practiceTest,
		practiceTestCreatedAt:
			serverTimestamp(),
	});
}

/*
 * Save generated Smart Study
 */

export async function saveSmartStudy(
	userId,
	topicId,
	materialId,
	smartStudy,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!topicId) {
		throw new Error("Topic ID is required.");
	}

	if (!materialId) {
		throw new Error(
			"Material ID is required.",
		);
	}

	if (!smartStudy) {
		throw new Error(
			"Smart Study is required.",
		);
	}

	const materialRef = doc(
		db,
		"users",
		userId,
		"studyTopics",
		topicId,
		"materials",
		materialId,
	);

	await updateDoc(materialRef, {
		smartStudy: smartStudy,
		smartStudyCreatedAt:
			serverTimestamp(),
	});
}

/*
 * Delete a Study material
 */

export async function deleteStudyMaterial(
	userId,
	topicId,
	materialId,
) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!topicId) {
		throw new Error("Topic ID is required.");
	}

	if (!materialId) {
		throw new Error(
			"Material ID is required.",
		);
	}

	const materialRef = doc(
		db,
		"users",
		userId,
		"studyTopics",
		topicId,
		"materials",
		materialId,
	);

	await deleteDoc(materialRef);
}

/*
 * ================================
 * TASBIH
 * ================================
 */

const DEFAULT_TASBIH_ITEMS = [
	{
		name: "SubhanAllah",
		arabic: "سُبْحَانَ اللهِ",
		transliteration: "SubhanAllāh",
		meaning: "Glory be to Allah",
		type: "dhikr",
		target: 33,
	},

	{
		name: "Alhamdulillah",
		arabic: "الْحَمْدُ لِلَّهِ",
		transliteration: "Alhamdulillāh",
		meaning: "All praise belongs to Allah",
		type: "dhikr",
		target: 33,
	},

	{
		name: "Allahu Akbar",
		arabic: "اللهُ أَكْبَرُ",
		transliteration: "Allāhu Akbar",
		meaning: "Allah is the Greatest",
		type: "dhikr",
		target: 33,
	},

	{
		name: "Astaghfirullah",
		arabic: "أَسْتَغْفِرُ اللهَ",
		transliteration: "Astaghfirullāh",
		meaning: "I seek forgiveness from Allah",
		type: "dhikr",
		target: 100,
	},

	{
		name: "La ilaha illallah",
		arabic: "لَا إِلٰهَ إِلَّا اللهُ",
		transliteration: "Lā ilāha illallāh",
		meaning:
			"There is no deity worthy of worship except Allah",
		type: "dhikr",
		target: 100,
	},
];

export async function initializeTasbihItems(
	userId,
) {
	if (!userId) {
		throw new Error(
			"User ID is required.",
		);
	}

	const metaRef = doc(
		db,
		"users",
		userId,
		"tasbihMeta",
		"config",
	);

	const metaSnapshot =
		await getDoc(metaRef);

	if (metaSnapshot.exists()) {
		return;
	}

	const itemsRef = collection(
		db,
		"users",
		userId,
		"tasbihItems",
	);

	for (
		const item of DEFAULT_TASBIH_ITEMS
	) {
		await addDoc(itemsRef, {
			...item,
			createdAt:
				serverTimestamp(),
			updatedAt:
				serverTimestamp(),
		});
	}

	await setDoc(
		metaRef,
		{
			initialized: true,
			initializedAt:
				serverTimestamp(),
		},
	);
}

export async function getTasbihItems(
	userId,
) {
	if (!userId) {
		throw new Error(
			"User ID is required.",
		);
	}

	await initializeTasbihItems(userId);

	const itemsRef = collection(
		db,
		"users",
		userId,
		"tasbihItems",
	);

	const snapshot =
		await getDocs(itemsRef);

	const items = snapshot.docs.map(
		(itemDoc) => ({
			id: itemDoc.id,
			...itemDoc.data(),
		}),
	);

	items.sort((a, b) => {
		const aTime =
			a.createdAt?.toMillis?.() ?? 0;

		const bTime =
			b.createdAt?.toMillis?.() ?? 0;

		return bTime - aTime;
	});

	return items;
}

export async function createTasbihItem(
	userId,
	item,
) {
	if (!userId) {
		throw new Error(
			"User ID is required.",
		);
	}

	if (!item?.name?.trim()) {
		throw new Error(
			"Item name is required.",
		);
	}

	const itemsRef = collection(
		db,
		"users",
		userId,
		"tasbihItems",
	);

	const itemData = {
		name: item.name.trim(),
		arabic:
			item.arabic?.trim() || "",
		transliteration:
			item.transliteration?.trim() || "",
		meaning:
			item.meaning?.trim() || "",
		type:
			item.type || "dhikr",
		target:
			Number(item.target) > 0
				? Number(item.target)
				: 33,
		createdAt:
			serverTimestamp(),
		updatedAt:
			serverTimestamp(),
	};

	const itemRef = await addDoc(
		itemsRef,
		itemData,
	);

	return {
		id: itemRef.id,
		...itemData,
	};
}

export async function updateTasbihItem(
	userId,
	itemId,
	updates,
) {
	if (!userId) {
		throw new Error(
			"User ID is required.",
		);
	}

	if (!itemId) {
		throw new Error(
			"Item ID is required.",
		);
	}

	const itemRef = doc(
		db,
		"users",
		userId,
		"tasbihItems",
		itemId,
	);

	await updateDoc(itemRef, {
		...updates,
		updatedAt:
			serverTimestamp(),
	});
}

export async function deleteTasbihItem(
	userId,
	itemId,
) {
	if (!userId) {
		throw new Error(
			"User ID is required.",
		);
	}

	if (!itemId) {
		throw new Error(
			"Item ID is required.",
		);
	}

	const itemRef = doc(
		db,
		"users",
		userId,
		"tasbihItems",
		itemId,
	);

	await deleteDoc(itemRef);
}

export async function getTasbihProgress(
	userId,
	date,
) {
	if (!userId) {
		throw new Error(
			"User ID is required.",
		);
	}

	if (!date) {
		throw new Error(
			"Date is required.",
		);
	}

	const progressRef = doc(
		db,
		"users",
		userId,
		"tasbihProgress",
		date,
	);

	const snapshot =
		await getDoc(progressRef);

	if (!snapshot.exists()) {
		return {
			id: date,
			date,
			counts: {},
			total: 0,
		};
	}

	return {
		id: snapshot.id,
		...snapshot.data(),
	};
}

export async function saveTasbihProgress(
	userId,
	date,
	counts,
) {
	if (!userId) {
		throw new Error(
			"User ID is required.",
		);
	}

	if (!date) {
		throw new Error(
			"Date is required.",
		);
	}

	const progressRef = doc(
		db,
		"users",
		userId,
		"tasbihProgress",
		date,
	);

	const cleanCounts = {
		...counts,
	};

	const total = Object.values(
		cleanCounts,
	).reduce(
		(sum, count) =>
			sum + Number(count || 0),
		0,
	);

	await setDoc(
		progressRef,
		{
			counts: cleanCounts,
			total,
			updatedAt:
				serverTimestamp(),
		},
		{
			merge: true,
		},
	);

	return {
		counts: cleanCounts,
		total,
	};
}