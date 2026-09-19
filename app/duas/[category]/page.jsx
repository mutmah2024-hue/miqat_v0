"use client";

import Sidebar from "../../components/Sidebar";
import ThemeToggle from "../../components/ThemeToggle";

import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "../../../lib/firebase";

import {
  getAdhkar,
} from "../../../lib/adhkar";

import generalAdhkarData from "../../../data/generaladhkar.json";

export default function DuaCategoryPage({
  params,
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [categoryId, setCategoryId] =
    useState("");

  const [category, setCategory] =
    useState(null);

  const [entries, setEntries] =
    useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [count, setCount] =
    useState(0);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          setUser(currentUser);
          setLoading(false);

          if (!currentUser) {
            return;
          }

          try {
            const resolvedParams =
              await params;

            const currentCategory =
              resolvedParams.category;

            setCategoryId(
              currentCategory
            );

            let currentCategoryData = null;

            if (
              currentCategory ===
                "morning" ||
              currentCategory ===
                "evening"
            ) {
              currentCategoryData = {
                title:
                  currentCategory ===
                  "morning"
                    ? "Morning Adhkār"
                    : "Evening Adhkār",

                description:
                  currentCategory ===
                  "morning"
                    ? "Begin your day with remembrance of Allah and the morning adhkār."
                    : "End your day with remembrance, protection, and gratitude.",
              };
            } else {
              currentCategoryData =
                generalAdhkarData.chapters.find(
                  (chapter) =>
                    chapter.id ===
                    currentCategory
                );
            }

            if (!currentCategoryData) {
              throw new Error(
                "This adhkār collection could not be found."
              );
            }

            const adhkar =
              await getAdhkar(
                currentCategory
              );

            if (
              !Array.isArray(adhkar)
            ) {
              throw new Error(
                "The adhkār could not be loaded."
              );
            }

            setCategory(
              currentCategoryData
            );

            setEntries(adhkar);
            setCurrentIndex(0);
            setCount(0);
          } catch (error) {
            console.error(
              "Error loading adhkār:",
              error
            );

            setError(
              error.message ||
                "Unable to load the adhkār."
            );
          }
        }
      );

    return () =>
      unsubscribe();
  }, [params]);

  const currentEntry =
    entries[currentIndex];

  const totalEntries =
    entries.length;

  const goToPrevious = () => {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex(
      (current) => current - 1
    );

    setCount(0);
  };

  const goToNext = () => {
    if (
      currentIndex >=
      totalEntries - 1
    ) {
      return;
    }

    setCurrentIndex(
      (current) => current + 1
    );

    setCount(0);
  };

  const increaseCount = () => {
    setCount(
      (current) => current + 1
    );
  };

  const decreaseCount = () => {
    setCount(
      (current) =>
        Math.max(0, current - 1)
    );
  };

  const resetCount = () => {
    setCount(0);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-soft border-t-primary" />

          <p className="text-sm text-muted">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center">
          <p className="text-sm text-muted">
            You need to sign in to access Wasl.
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

  if (!category) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center">
          <p className="text-sm text-muted">
            This adhkār collection could not be found.
          </p>

          <a
            href="/duas"
            className="mt-5 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Back to Duas
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar user={user} />

        <div className="min-w-0 flex-1">
          <div className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6 lg:px-10 lg:py-14">

            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                  Adhkār
                </p>

                <h1 className="mt-3 break-words text-3xl font-semibold tracking-tight text-primary">
                  {category.title}
                </h1>

                <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-muted">
                  {category.description ||
                    `${category.entryCount || entries.length} ${
                      (category.entryCount ||
                        entries.length) === 1
                        ? "invocation"
                        : "invocations"
                    } in this collection.`}
                </p>
              </div>

              <ThemeToggle />
            </div>

            {error && (
              <div className="mt-8 rounded-2xl border border-border bg-soft px-5 py-4 text-sm text-primary">
                {error}
              </div>
            )}

            {!error &&
              totalEntries === 0 && (
                <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
                  <p className="text-sm text-muted">
                    No adhkār are available for this collection yet.
                  </p>
                </section>
              )}

            {currentEntry && (
              <section className="mt-10">

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      Dhikr
                    </p>

                    <p className="mt-2 text-sm font-medium text-primary">
                      {currentIndex + 1} /{" "}
                      {totalEntries}
                    </p>
                  </div>

                  {currentEntry.count && (
                    <p className="text-xs text-muted">
                      Repeat {currentEntry.count}{" "}
                      {currentEntry.count === 1
                        ? "time"
                        : "times"}
                    </p>
                  )}
                </div>

                <article className="mt-5 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10">

                  <div className="text-right">
                    <p
                      dir="rtl"
                      lang="ar"
                      className="break-words text-2xl leading-[2.2] text-primary sm:text-3xl sm:leading-[2.4]"
                    >
                      {currentEntry.arabic ||
                        currentEntry.text ||
                        currentEntry.content}
                    </p>
                  </div>

                  {currentEntry.transliteration && (
                    <div className="mt-8 border-t border-border pt-7">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        Transliteration
                      </p>

                      <p className="mt-3 break-words text-sm leading-7 text-foreground">
                        {
                          currentEntry.transliteration
                        }
                      </p>
                    </div>
                  )}

                  {(
                    currentEntry.translation ||
                    currentEntry.meaning
                  ) && (
                    <div className="mt-8 border-t border-border pt-7">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        Translation
                      </p>

                      <p className="mt-3 break-words text-sm leading-7 text-foreground">
                        {currentEntry.translation ||
                          currentEntry.meaning}
                      </p>
                    </div>
                  )}

                  {currentEntry.source && (
                    <div className="mt-8 border-t border-border pt-7">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        Source
                      </p>

                      <p className="mt-3 break-words text-sm leading-7 text-muted">
                        {currentEntry.source}
                      </p>
                    </div>
                  )}

                </article>

                <div className="mt-6 rounded-2xl border border-border bg-surface p-5">

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        Counter
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-primary">
                        {count}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetCount}
                      className="rounded-xl border border-border px-4 py-2 text-sm text-muted transition-colors hover:bg-elevated hover:text-primary"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={decreaseCount}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-xl text-primary transition-colors hover:bg-elevated"
                      aria-label="Decrease count"
                    >
                      −
                    </button>

                    <button
                      type="button"
                      onClick={increaseCount}
                      className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Count
                    </button>
                  </div>

                </div>

                <div className="mt-6 flex items-center justify-between gap-4">

                  <button
                    type="button"
                    onClick={goToPrevious}
                    disabled={
                      currentIndex === 0
                    }
                    className="flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-primary transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Previous
                  </button>

                  <p className="hidden text-xs text-muted sm:block">
                    {currentIndex + 1} of{" "}
                    {totalEntries}
                  </p>

                  <button
                    type="button"
                    onClick={goToNext}
                    disabled={
                      currentIndex >=
                      totalEntries - 1
                    }
                    className="flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-primary transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                  </button>

                </div>

              </section>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}