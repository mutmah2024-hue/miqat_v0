import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";


// Get a user's Focus settings

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


// Save a user's Focus settings

export async function saveFocusSettings(
  userId,
  settings
) {
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
    }
  );
}


// Get today's Focus statistics

export async function getTodayFocusStats(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const statsRef = doc(
    db,
    "users",
    userId,
    "focusStats",
    today
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


// Save a completed Focus session

export async function saveCompletedFocusSession(
  userId,
  duration
) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!duration || duration < 1) {
    throw new Error(
      "Focus duration must be greater than 0."
    );
  }

  const today = new Date()
    .toISOString()
    .split("T")[0];

  /*
   * Today's Focus statistics
   */

  const statsRef = doc(
    db,
    "users",
    userId,
    "focusStats",
    today
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
    "focusSessions"
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
    }
  );


  return {
    sessions: updatedSessions,

    focusTime: updatedFocusTime,
  };
}

// Get a user's Focus history

export async function getFocusHistory(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const sessionsRef = collection(
    db,
    "users",
    userId,
    "focusSessions"
  );

  const snapshot = await getDocs(sessionsRef);

  const sessions = snapshot.docs.map((sessionDoc) => ({
    id: sessionDoc.id,
    ...sessionDoc.data(),
  }));

  sessions.sort((a, b) => {
    const aTime = a.completedAt?.toMillis?.() ?? 0;
    const bTime = b.completedAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });

  return sessions;
}
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

export async function saveQuranDailyGoal(userId, dailyGoal) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!dailyGoal || dailyGoal < 1) {
		throw new Error("Daily goal must be greater than 0.");
	}

	const userRef = doc(db, "users", userId);

	await setDoc(
		userRef,
		{
			quranDailyGoal: dailyGoal,
		},
		{
			merge: true,
		}
	);
}


/*
 * Get today's Qur'an progress
 */

export async function getTodayQuranProgress(userId) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const today = new Date()
		.toISOString()
		.split("T")[0];

	const progressRef = doc(
		db,
		"users",
		userId,
		"quranProgress",
		today
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

export async function saveTodayQuranProgress(userId, pagesRead) {
	if (!userId) {
		throw new Error("User ID is required.");
	}

	const today = new Date()
		.toISOString()
		.split("T")[0];

	const progressRef = doc(
		db,
		"users",
		userId,
		"quranProgress",
		today
	);

	await setDoc(
		progressRef,
		{
			pagesRead,
			updatedAt: serverTimestamp(),
		},
		{
			merge: true,
		}
	);
}


/*
 * Save last Qur'an page
 */

export async function saveLastQuranPage(userId, pageNumber) {
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
		}
	);
}