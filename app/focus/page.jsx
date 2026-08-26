
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";

import {
  getFocusSettings,
  saveFocusSettings,
  getTodayFocusStats,
  saveCompletedFocusSession,
  getFocusHistory,
} from "../../lib/firestore";

export default function Focus() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [dailyGoal, setDailyGoal] = useState(60);

  const [timeLeft, setTimeLeft] = useState(25 * 60);

  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("focus");

  const [customFocus, setCustomFocus] = useState("");
  const [customBreak, setCustomBreak] = useState("");
  const [customGoal, setCustomGoal] = useState("");

  const [showCustomFocus, setShowCustomFocus] = useState(false);
  const [showCustomBreak, setShowCustomBreak] = useState(false);
  const [showCustomGoal, setShowCustomGoal] = useState(false);

  const [sessions, setSessions] = useState(0);
  const [focusTime, setFocusTime] = useState(0);

  const [focusHistory, setFocusHistory] = useState([]);

  const [savingSession, setSavingSession] = useState(false);


  /*
   * Authentication
   */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);


  /*
   * Load Focus settings
   */

  useEffect(() => {
    if (!user) return;

    async function loadSettings() {
      try {
        const settings =
          await getFocusSettings(user.uid);

        if (settings) {
          setFocusMinutes(
            settings.focusDuration
          );

          setBreakMinutes(
            settings.breakDuration
          );

          setDailyGoal(
            settings.focusGoal
          );

          setTimeLeft(
            settings.focusDuration * 60
          );
        }
      } catch (error) {
        console.error(
          "Could not load Focus settings:",
          error
        );
      }
    }

    loadSettings();
  }, [user]);


  /*
   * Load today's Focus statistics
   */

  useEffect(() => {
    if (!user) return;

    async function loadTodayStats() {
      try {
        const stats =
          await getTodayFocusStats(user.uid);

        setSessions(stats.sessions);
        setFocusTime(stats.focusTime);
      } catch (error) {
        console.error(
          "Could not load Focus statistics:",
          error
        );
      } finally {
        setSettingsLoading(false);
      }
    }

    loadTodayStats();
  }, [user]);


  /*
   * Load Focus history
   */

  useEffect(() => {
    if (!user) return;

    async function loadFocusHistory() {
      try {
        const history =
          await getFocusHistory(user.uid);

        setFocusHistory(history);
      } catch (error) {
        console.error(
          "Could not load Focus history:",
          error
        );
      }
    }

    loadFocusHistory();
  }, [user]);


  /*
   * Timer
   */

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {

          /*
           * Focus session completed
           */

          if (mode === "focus") {
            setIsRunning(false);
            setSavingSession(true);

            saveCompletedFocusSession(
              user.uid,
              focusMinutes
            )
              .then((updatedStats) => {
                setSessions(
                  updatedStats.sessions
                );

                setFocusTime(
                  updatedStats.focusTime
                );

                /*
                 * Reload history so the
                 * new session appears
                 */

                return getFocusHistory(
                  user.uid
                );
              })
              .then((history) => {
                setFocusHistory(history);

                /*
                 * Move to break
                 */

                setMode("break");
                setTimeLeft(
                  breakMinutes * 60
                );
              })
              .catch((error) => {
                console.error(
                  "Could not save completed Focus session:",
                  error
                );
              })
              .finally(() => {
                setSavingSession(false);
              });

            return 0;
          }


          /*
           * Break completed
           */

          setMode("focus");

          return focusMinutes * 60;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    mode,
    focusMinutes,
    breakMinutes,
    user,
  ]);


  /*
   * Timer display
   */

  const minutes =
    Math.floor(timeLeft / 60);

  const seconds =
    timeLeft % 60;

  const formattedTime =
    `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;


  /*
   * Save settings
   */

  const saveSettings = async (
    newFocusMinutes,
    newBreakMinutes,
    newGoal
  ) => {
    if (!user) return;

    try {
      await saveFocusSettings(
        user.uid,
        {
          focusDuration:
            newFocusMinutes ??
            focusMinutes,

          breakDuration:
            newBreakMinutes ??
            breakMinutes,

          focusGoal:
            newGoal ??
            dailyGoal,
        }
      );
    } catch (error) {
      console.error(
        "Could not save Focus settings:",
        error
      );
    }
  };


  /*
   * Focus duration
   */

  const handleFocusChange = (minutes) => {
    setFocusMinutes(minutes);
    setTimeLeft(minutes * 60);
    setMode("focus");
    setIsRunning(false);

    saveSettings(
      minutes,
      null,
      null
    );
  };


  /*
   * Custom focus
   */

  const handleCustomFocus = () => {
    const minutes = Number(customFocus);

    if (
      !minutes ||
      minutes < 1 ||
      minutes > 180
    ) {
      return;
    }

    setFocusMinutes(minutes);
    setTimeLeft(minutes * 60);
    setMode("focus");
    setIsRunning(false);
    setShowCustomFocus(false);

    saveSettings(
      minutes,
      null,
      null
    );
  };


  /*
   * Break duration
   */

  const handleBreakChange = (minutes) => {
    setBreakMinutes(minutes);

    saveSettings(
      null,
      minutes,
      null
    );

    if (
      mode === "break" &&
      !isRunning
    ) {
      setTimeLeft(minutes * 60);
    }
  };


  /*
   * Custom break
   */

  const handleCustomBreak = () => {
    const minutes = Number(customBreak);

    if (
      !minutes ||
      minutes < 1 ||
      minutes > 60
    ) {
      return;
    }

    setBreakMinutes(minutes);
    setShowCustomBreak(false);

    saveSettings(
      null,
      minutes,
      null
    );

    if (mode === "break") {
      setTimeLeft(minutes * 60);
      setIsRunning(false);
    }
  };


  /*
   * Daily goal
   */

  const handleGoalChange = (minutes) => {
    setDailyGoal(minutes);
    setShowCustomGoal(false);

    saveSettings(
      null,
      null,
      minutes
    );
  };


  /*
   * Custom daily goal
   */

  const handleCustomGoal = () => {
    const minutes = Number(customGoal);

    if (
      !minutes ||
      minutes < 1 ||
      minutes > 1440
    ) {
      return;
    }

    setDailyGoal(minutes);
    setShowCustomGoal(false);

    saveSettings(
      null,
      null,
      minutes
    );
  };


  /*
   * Reset
   */

  const resetTimer = () => {
    setIsRunning(false);

    if (mode === "focus") {
      setTimeLeft(
        focusMinutes * 60
      );
    } else {
      setTimeLeft(
        breakMinutes * 60
      );
    }
  };


  /*
   * Progress
   */

  const progress = Math.min(
    (focusTime / dailyGoal) * 100,
    100
  );


  /*
   * Loading
   */

  if (
    loading ||
    settingsLoading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-soft border-t-primary" />

          <p className="text-sm text-primary">
            Loading...
          </p>
        </div>
      </main>
    );
  }


  /*
   * Not signed in
   */

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center">
          <p className="text-sm text-muted">
            You need to sign in to access Mīqāt.
          </p>

          <a
            href="/Signinup"
            className="mt-5 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Sign in
          </a>
        </div>
      </main>
    );
  }


  /*
   * Page
   */

  return (
    <main className="min-h-screen bg-background text-foreground">

      <div className="flex min-h-screen">

        <Sidebar user={user} />

        <div className="min-w-0 flex-1">

          {/* Header */}

          <header className="border-b border-border bg-surface">
            <div className="mx-auto flex h-20 max-w-7xl items-center px-6 lg:px-10">

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                  FOCUS
                </p>

                <h1 className="mt-1 text-xl font-semibold text-primary">
                  Protect your attention
                </h1>

              </div>

            </div>
          </header>


          {/* Content */}

          <div className="mx-auto max-w-4xl px-6 py-10 pb-24 lg:px-10 lg:py-14">

            <p className="text-sm leading-7 text-muted">
              Give your attention to one thing at a time.
            </p>


            {/* Timer */}

            <section className="mt-8 rounded-3xl bg-primary p-8 text-white sm:p-12">

              <div className="text-center">

                <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary-light">
                  {mode === "focus"
                    ? "FOCUS SESSION"
                    : "BREAK"}
                </p>

                <p className="mt-8 text-7xl font-semibold tracking-tight tabular-nums sm:text-8xl">
                  {formattedTime}
                </p>

                <p className="mt-4 text-sm text-primary-light">
                  {mode === "focus"
                    ? "Stay with what matters."
                    : "Take a moment to rest."}
                </p>


                <div className="mt-10 flex justify-center gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setIsRunning(!isRunning)
                    }
                    disabled={savingSession}
                    className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRunning
                      ? "Pause"
                      : savingSession
                        ? "Saving..."
                        : "Start"}
                  </button>


                  <button
                    type="button"
                    onClick={resetTimer}
                    disabled={savingSession}
                    className="rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reset
                  </button>

                </div>

              </div>

            </section>


            {/* Settings */}

            <section className="mt-6 grid gap-6 sm:grid-cols-2">


              {/* Focus duration */}

              <div className="rounded-3xl border border-border bg-surface p-7">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                  FOCUS DURATION
                </p>

                <h2 className="mt-3 text-lg font-semibold text-primary">
                  How long do you want to focus?
                </h2>

                <div className="mt-5 flex flex-wrap gap-2">

                  {[25, 45, 60].map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() =>
                        handleFocusChange(
                          minutes
                        )
                      }
                      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                        focusMinutes === minutes
                          ? "bg-primary text-white"
                          : "bg-soft text-primary hover:bg-elevated"
                      }`}
                    >
                      {minutes} min
                    </button>
                  ))}


                  <button
                    type="button"
                    onClick={() =>
                      setShowCustomFocus(
                        !showCustomFocus
                      )
                    }
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                      showCustomFocus
                        ? "bg-primary text-white"
                        : "bg-soft text-primary hover:bg-elevated"
                    }`}
                  >
                    Custom
                  </button>

                </div>


                {showCustomFocus && (
                  <div className="mt-4 flex gap-2">

                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={customFocus}
                      onChange={(event) =>
                        setCustomFocus(
                          event.target.value
                        )
                      }
                      placeholder="Minutes"
                      className="h-11 w-28 rounded-xl border border-border bg-background px-3 text-sm text-primary outline-none focus:border-primary"
                    />

                    <button
                      type="button"
                      onClick={handleCustomFocus}
                      className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white"
                    >
                      Set
                    </button>

                  </div>
                )}

              </div>


              {/* Break duration */}

              <div className="rounded-3xl border border-border bg-surface p-7">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                  BREAK DURATION
                </p>

                <h2 className="mt-3 text-lg font-semibold text-primary">
                  How long should your break be?
                </h2>

                <div className="mt-5 flex flex-wrap gap-2">

                  {[5, 10, 15].map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() =>
                        handleBreakChange(
                          minutes
                        )
                      }
                      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                        breakMinutes === minutes
                          ? "bg-primary text-white"
                          : "bg-soft text-primary hover:bg-elevated"
                      }`}
                    >
                      {minutes} min
                    </button>
                  ))}


                  <button
                    type="button"
                    onClick={() =>
                      setShowCustomBreak(
                        !showCustomBreak
                      )
                    }
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                      showCustomBreak
                        ? "bg-primary text-white"
                        : "bg-soft text-primary hover:bg-elevated"
                    }`}
                  >
                    Custom
                  </button>

                </div>


                {showCustomBreak && (
                  <div className="mt-4 flex gap-2">

                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={customBreak}
                      onChange={(event) =>
                        setCustomBreak(
                          event.target.value
                        )
                      }
                      placeholder="Minutes"
                      className="h-11 w-28 rounded-xl border border-border bg-background px-3 text-sm text-primary outline-none focus:border-primary"
                    />

                    <button
                      type="button"
                      onClick={handleCustomBreak}
                      className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white"
                    >
                      Set
                    </button>

                  </div>
                )}

              </div>

            </section>


            {/* Daily goal */}

            <section className="mt-6 rounded-3xl border border-border bg-surface p-7 sm:p-8">

              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                DAILY GOAL
              </p>

              <h2 className="mt-3 text-lg font-semibold text-primary">
                How much do you want to focus today?
              </h2>

              <div className="mt-5 flex flex-wrap gap-2">

                {[30, 60, 90, 120].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() =>
                      handleGoalChange(
                        minutes
                      )
                    }
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      dailyGoal === minutes
                        ? "bg-primary text-white"
                        : "bg-soft text-primary hover:bg-elevated"
                    }`}
                  >
                    {minutes} min
                  </button>
                ))}


                <button
                  type="button"
                  onClick={() =>
                    setShowCustomGoal(
                      !showCustomGoal
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                    showCustomGoal
                      ? "bg-primary text-white"
                      : "bg-soft text-primary hover:bg-elevated"
                  }`}
                >
                  Custom
                </button>

              </div>


              {showCustomGoal && (
                <div className="mt-4 flex gap-2">

                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={customGoal}
                    onChange={(event) =>
                      setCustomGoal(
                        event.target.value
                      )
                    }
                    placeholder="Minutes"
                    className="h-11 w-28 rounded-xl border border-border bg-background px-3 text-sm text-primary outline-none focus:border-primary"
                  />

                  <button
                    type="button"
                    onClick={handleCustomGoal}
                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white"
                  >
                    Set
                  </button>

                </div>
              )}

            </section>


            {/* Today's focus */}

            <section className="mt-6 rounded-3xl border border-border bg-surface p-7 sm:p-8">

              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                TODAY
              </p>

              <h2 className="mt-3 text-xl font-semibold text-primary">
                Your focus
              </h2>


              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">

                <div>
                  <p className="text-xs text-muted">
                    Sessions
                  </p>

                  <p className="mt-2 text-xl font-semibold text-primary">
                    {sessions}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-muted">
                    Focus time
                  </p>

                  <p className="mt-2 text-xl font-semibold text-primary">
                    {focusTime} min
                  </p>
                </div>


                <div>
                  <p className="text-xs text-muted">
                    Goal
                  </p>

                  <p className="mt-2 text-xl font-semibold text-primary">
                    {dailyGoal} min
                  </p>
                </div>

              </div>


              {/* Progress bar */}

              <div className="mt-8">

                <div className="flex items-center justify-between text-xs text-muted">

                  <span>
                    {focusTime} / {dailyGoal} min
                  </span>

                  <span>
                    {Math.round(progress)}%
                  </span>

                </div>


                <div className="mt-3 h-3 overflow-hidden rounded-full bg-soft">

                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

              </div>

            </section>


            {/* Focus history */}

            <section className="mt-6 rounded-3xl border border-border bg-surface p-7 sm:p-8">

              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                HISTORY
              </p>

              <h2 className="mt-3 text-xl font-semibold text-primary">
                Focus history
              </h2>


              {focusHistory.length === 0 ? (

                <p className="mt-6 text-sm leading-7 text-muted">
                  Your completed focus sessions will appear here.
                </p>

              ) : (

                <div className="mt-6 space-y-3">

                  {focusHistory.map(
                    (session) => {

                      const completedDate =
                        session.completedAt?.toDate?.();

                      return (

                        <div
                          key={session.id}
                          className="flex items-center justify-between rounded-2xl bg-soft px-5 py-4"
                        >

                          <div>

                            <p className="text-sm font-medium text-primary">
                              Focus session
                            </p>

                            <p className="mt-1 text-xs text-muted">
                              {completedDate
                                ? completedDate.toLocaleString()
                                : session.date}
                            </p>

                          </div>


                          <p className="text-sm font-semibold text-primary">
                            {session.duration} min
                          </p>

                        </div>

                      );
                    }
                  )}

                </div>

              )}

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}

