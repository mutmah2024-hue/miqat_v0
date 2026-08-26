
"use client";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../lib/firebase";
import { getPrayerTimes } from "../../lib/aladhan";

const prayerNames = [
  { key: "Fajr", label: "Fajr" },
  { key: "Dhuhr", label: "Dhuhr" },
  { key: "Asr", label: "Asr" },
  { key: "Maghrib", label: "Maghrib" },
  { key: "Isha", label: "Isha" },
];

const locations = [
  {
    state: "Abia",
    city: "Umuahia",
    latitude: 5.532,
    longitude: 7.486,
  },
  {
    state: "Adamawa",
    city: "Yola",
    latitude: 9.203,
    longitude: 12.495,
  },
  {
    state: "Akwa Ibom",
    city: "Uyo",
    latitude: 5.037,
    longitude: 7.912,
  },
  {
    state: "Anambra",
    city: "Awka",
    latitude: 6.21,
    longitude: 7.074,
  },
  {
    state: "Bauchi",
    city: "Bauchi",
    latitude: 10.315,
    longitude: 9.844,
  },
  {
    state: "Bayelsa",
    city: "Yenagoa",
    latitude: 4.924,
    longitude: 6.264,
  },
  {
    state: "Benue",
    city: "Makurdi",
    latitude: 7.732,
    longitude: 8.539,
  },
  {
    state: "Borno",
    city: "Maiduguri",
    latitude: 11.833,
    longitude: 13.151,
  },
  {
    state: "Cross River",
    city: "Calabar",
    latitude: 4.976,
    longitude: 8.344,
  },
  {
    state: "Delta",
    city: "Asaba",
    latitude: 6.194,
    longitude: 6.731,
  },
  {
    state: "Ebonyi",
    city: "Abakaliki",
    latitude: 6.324,
    longitude: 8.113,
  },
  {
    state: "Edo",
    city: "Benin City",
    latitude: 6.335,
    longitude: 5.603,
  },
  {
    state: "Ekiti",
    city: "Ado Ekiti",
    latitude: 7.623,
    longitude: 5.221,
  },
  {
    state: "Enugu",
    city: "Enugu",
    latitude: 6.458,
    longitude: 7.546,
  },
  {
    state: "Gombe",
    city: "Gombe",
    latitude: 10.289,
    longitude: 11.168,
  },
  {
    state: "Imo",
    city: "Owerri",
    latitude: 5.489,
    longitude: 7.033,
  },
  {
    state: "Jigawa",
    city: "Dutse",
    latitude: 11.756,
    longitude: 9.339,
  },
  {
    state: "Kaduna",
    city: "Kaduna",
    latitude: 10.526,
    longitude: 7.438,
  },
  {
    state: "Kano",
    city: "Kano",
    latitude: 12.002,
    longitude: 8.592,
  },
  {
    state: "Katsina",
    city: "Katsina",
    latitude: 12.988,
    longitude: 7.617,
  },
  {
    state: "Kebbi",
    city: "Birnin Kebbi",
    latitude: 12.453,
    longitude: 4.197,
  },
  {
    state: "Kogi",
    city: "Lokoja",
    latitude: 7.802,
    longitude: 6.734,
  },
  {
    state: "Kwara",
    city: "Ilorin",
    latitude: 8.496,
    longitude: 4.542,
  },
  {
    state: "Lagos",
    city: "Ikeja",
    latitude: 6.6018,
    longitude: 3.3515,
  },
  {
    state: "Nasarawa",
    city: "Lafia",
    latitude: 8.491,
    longitude: 8.515,
  },
  {
    state: "Niger",
    city: "Minna",
    latitude: 9.613,
    longitude: 6.556,
  },
  {
    state: "Ogun",
    city: "Abeokuta",
    latitude: 7.1475,
    longitude: 3.3619,
  },
  {
    state: "Ondo",
    city: "Akure",
    latitude: 7.2526,
    longitude: 5.1931,
  },
  {
    state: "Osun",
    city: "Osogbo",
    latitude: 7.7827,
    longitude: 4.5418,
  },
  {
    state: "Oyo",
    city: "Ibadan",
    latitude: 7.3775,
    longitude: 3.947,
  },
  {
    state: "Plateau",
    city: "Jos",
    latitude: 9.8965,
    longitude: 8.8583,
  },
  {
    state: "Rivers",
    city: "Port Harcourt",
    latitude: 4.8156,
    longitude: 7.0498,
  },
  {
    state: "Sokoto",
    city: "Sokoto",
    latitude: 13.0059,
    longitude: 5.2476,
  },
  {
    state: "Taraba",
    city: "Jalingo",
    latitude: 8.8937,
    longitude: 11.3596,
  },
  {
    state: "Yobe",
    city: "Damaturu",
    latitude: 11.747,
    longitude: 11.96,
  },
  {
    state: "Zamfara",
    city: "Gusau",
    latitude: 12.17,
    longitude: 6.6641,
  },
  {
    state: "FCT",
    city: "Abuja",
    latitude: 9.0765,
    longitude: 7.3986,
  },
];

function convertTo12Hour(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  let hour = Number(hours);

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${String(hour).padStart(2, "0")}:${minutes} ${period}`;
}

function getNextPrayer(timings) {
  if (!timings) return null;

  const now = new Date();

  for (const prayer of prayerNames) {
    const time = timings[prayer.key];

    if (!time) continue;

    const [hours, minutes] = time.split(":").map(Number);

    const prayerTime = new Date(now);

    prayerTime.setHours(hours, minutes, 0, 0);

    if (prayerTime > now) {
      return {
        name: prayer.label,
        time,
        isTomorrow: false,
      };
    }
  }

  const fajrTime = timings.Fajr;

  if (!fajrTime) return null;

  return {
    name: "Fajr",
    time: fajrTime,
    isTomorrow: true,
  };
}

function getCountdown(targetTime, isTomorrow = false) {
  if (!targetTime) return null;

  const now = new Date();

  const [hours, minutes] = targetTime
    .split(":")
    .map(Number);

  const target = new Date(now);

  target.setHours(hours, minutes, 0, 0);

  if (isTomorrow || target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const difference =
    target.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  }

  const totalSeconds = Math.floor(
    difference / 1000
  );

  const hoursLeft = Math.floor(
    totalSeconds / 3600
  );

  const minutesLeft = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const secondsLeft = totalSeconds % 60;

  return {
    hours: String(hoursLeft).padStart(2, "0"),
    minutes: String(minutesLeft).padStart(2, "0"),
    seconds: String(secondsLeft).padStart(2, "0"),
  };
}

export default function Dashboard() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [prayerData, setPrayerData] = useState(null);

  const [prayerLoading, setPrayerLoading] = useState(true);

  const [locationError, setLocationError] =
    useState("");

  const [selectedLocation, setSelectedLocation] =
    useState("");

  const [showLocationPicker, setShowLocationPicker] =
    useState(false);

  const [countdown, setCountdown] = useState(null);

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

  useEffect(() => {
    if (!prayerData?.timings) return;

    const updateCountdown = () => {
      const next = getNextPrayer(
        prayerData.timings
      );

      if (!next) {
        setCountdown(null);
        return;
      }

      setCountdown(
        getCountdown(
          next.time,
          next.isTomorrow
        )
      );
    };

    updateCountdown();

    const interval = setInterval(
      updateCountdown,
      1000
    );

    return () => clearInterval(interval);
  }, [prayerData]);

  /*
   * Load saved location
   * If there is no saved location,
   * ask for the user's current location.
   */

  useEffect(() => {
    if (!user) return;

    const savedLocation =
      localStorage.getItem("miqat_location");

    if (savedLocation) {
      try {
        const location =
          JSON.parse(savedLocation);

        setSelectedLocation(
          `${location.city}, ${location.state}`
        );

        getPrayerTimes(
          location.latitude,
          location.longitude
        )
          .then((data) => {
            setPrayerData(data);
          })
          .catch((error) => {
            console.error(error);

            setLocationError(
              "We couldn't load your prayer times."
            );

            setShowLocationPicker(true);
          })
          .finally(() => {
            setPrayerLoading(false);
          });

        return;
      } catch (error) {
        console.error(
          "Could not read saved location:",
          error
        );

        localStorage.removeItem(
          "miqat_location"
        );
      }
    }

    /*
     * No saved location
     * Try browser location.
     */

    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by this browser."
      );

      setPrayerLoading(false);
      setShowLocationPicker(true);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const {
          latitude,
          longitude,
        } = position.coords;

        try {
          setLocationError("");

          const data = await getPrayerTimes(
            latitude,
            longitude
          );

          setPrayerData(data);

          const currentLocation = {
            state: "Current location",
            city: "Current location",
            latitude,
            longitude,
          };

          localStorage.setItem(
            "miqat_location",
            JSON.stringify(currentLocation)
          );

          setSelectedLocation(
            "Current location"
          );
        } catch (error) {
          console.error(error);

          setLocationError(
            "We couldn't load your prayer times."
          );

          setShowLocationPicker(true);
        } finally {
          setPrayerLoading(false);
        }
      },

      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        setPrayerLoading(false);
        setShowLocationPicker(true);

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location could not be determined."
          );
        } else if (error.code === 3) {
          setLocationError(
            "Location request timed out."
          );
        } else {
          setLocationError(
            "We couldn't determine your location."
          );
        }
      }
    );
  }, [user]);

  /*
   * Select a location manually
   */

  const handleLocationSelect = async (
    location
  ) => {
    setSelectedLocation(
      `${location.city}, ${location.state}`
    );

    setLocationError("");

    setPrayerLoading(true);

    /*
     * Save the selected location
     * so it is remembered when the user
     * leaves and returns to the dashboard.
     */

    localStorage.setItem(
      "miqat_location",
      JSON.stringify(location)
    );

    try {
      const data = await getPrayerTimes(
        location.latitude,
        location.longitude
      );

      setPrayerData(data);

      setShowLocationPicker(false);
    } catch (error) {
      console.error(error);

      setLocationError(
        "We couldn't load prayer times for this location."
      );
    } finally {
      setPrayerLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-soft border-t-primary" />

          <h1 className="text-center text-primary">
            Loading...
          </h1>
        </div>
      </main>
    );
  }

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

  const firstName =
    user.displayName
      ?.trim()
      .split(" ")[0] || "there";

  const nextPrayer = getNextPrayer(
    prayerData?.timings
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar user={user} />
        <ThemeToggle/>

        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">

            {/* Greeting */}

            <section>
              <p className="text-sm font-medium tracking-wide text-muted">
                YOUR SPACE
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                Assalamu alaikum, {firstName}.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-foreground">
                Make room for what matters today.
              </p>

              {prayerData?.date?.hijri && (
                <p className="mt-2 text-sm text-muted">
                  {prayerData.date.hijri.day}{" "}
                  {prayerData.date.hijri.month.en}{" "}
                  {prayerData.date.hijri.year} AH
                </p>
              )}
            </section>

            {/* Next Prayer */}

            <section className="mt-10 rounded-3xl bg-primary p-7 text-white sm:p-9">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary-light">
                NEXT PRAYER
              </p>

              {prayerLoading ? (
                <div className="mt-6">
                  <div className="h-9 w-32 animate-pulse rounded-lg bg-white/20" />

                  <div className="mt-3 h-5 w-40 animate-pulse rounded bg-white/10" />
                </div>
              ) : !prayerData ? (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold">
                    Choose your location
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-primary-light">
                    {locationError ||
                      "Choose your state to see accurate prayer times."}
                  </p>

                  <select
                    defaultValue=""
                    onChange={(event) => {
                      const selected =
                        locations.find(
                          (location) =>
                            location.state ===
                            event.target.value
                        );

                      if (selected) {
                        handleLocationSelect(
                          selected
                        );
                      }
                    }}
                    className="mt-5 h-12 w-full max-w-sm rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none transition-colors focus:border-white/50"
                  >
                    <option
                      value=""
                      disabled
                      className="text-foreground"
                    >
                      Select your state
                    </option>

                    {locations.map(
                      (location) => (
                        <option
                          key={location.state}
                          value={location.state}
                          className="text-foreground"
                        >
                          {location.state}
                        </option>
                      )
                    )}
                  </select>
                </div>
              ) : nextPrayer ? (
                <div className="mt-6 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="text-4xl font-semibold">
                      {nextPrayer.name}
                    </h2>

                    <p className="mt-2 text-sm text-primary-light">
                      {nextPrayer.isTomorrow
                        ? "Tomorrow's first prayer"
                        : "Your next prayer"}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    {countdown && (
                      <p className="text-4xl font-semibold tabular-nums tracking-tight">
                        {countdown.hours}:
                        {countdown.minutes}:
                        {countdown.seconds}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-primary-light">
                      remaining
                    </p>

                    <p className="mt-1 text-xs text-primary-light">
                      {convertTo12Hour(
                        nextPrayer.time
                      )}{" "}
                      · {selectedLocation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <h2 className="text-3xl font-semibold">
                    Fajr
                  </h2>

                  <p className="mt-2 text-sm text-primary-light">
                    Tomorrow's first prayer
                  </p>
                </div>
              )}
            </section>

            {/* Change Location */}

            {prayerData && (
              <section className="mt-4">
                <button
                  type="button"
                  onClick={() =>
                    setShowLocationPicker(
                      !showLocationPicker
                    )
                  }
                  className="text-sm font-medium text-primary transition-opacity hover:opacity-70"
                >
                  {showLocationPicker
                    ? "Close location options"
                    : "Change location"}
                </button>

                {showLocationPicker && (
                  <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
                    <p className="text-sm font-medium text-primary">
                      Choose your city
                    </p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {locations.map(
                        (location) => (
                          <button
                            key={location.state}
                            type="button"
                            onClick={() =>
                              handleLocationSelect(
                                location
                              )
                            }
                            className="rounded-xl bg-soft px-4 py-3 text-left text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                          >
                            <span className="block">
                              {location.city}
                            </span>

                            <span className="mt-1 block text-xs opacity-60">
                              {location.state}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Today's Prayer Times */}

            {prayerData?.timings && (
              <section className="mt-6 rounded-3xl border border-border bg-surface p-7 sm:p-8">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                    TODAY
                  </p>

                  <h2 className="mt-3 text-xl font-semibold text-primary">
                    Prayer times
                  </h2>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-5">
                  {prayerNames.map(
                    (prayer) => (
                      <div
                        key={prayer.key}
                        className="rounded-2xl bg-elevated p-5"
                      >
                        <p className="text-sm font-medium text-muted">
                          {prayer.label}
                        </p>

                        <p className="mt-2 text-lg font-semibold text-primary">
                          {convertTo12Hour(
                            prayerData
                              .timings[
                              prayer.key
                            ]
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Main Features */}

            <section className="mt-6 grid gap-6 md:grid-cols-2">

              {/* Qur'an */}

              <article className="rounded-3xl border border-border bg-surface p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                      QUR'AN
                    </p>

                    <h2 className="mt-4 text-xl font-semibold text-primary">
                      Continue reading
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft text-primary">
                    ق
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-muted">
                  Pick up where you left off and continue your Qur'an reading.
                </p>

                <button
                  type="button"
                  className="mt-6 rounded-xl bg-soft px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  Continue reading
                </button>
              </article>

              {/* Focus */}

              <article className="rounded-3xl border border-border bg-surface p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                      FOCUS
                    </p>

                    <h2 className="mt-4 text-xl font-semibold text-primary">
                      Protect your attention
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft text-primary">
                    ◷
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-muted">
                  Start a focused session and give your attention to one thing.
                </p>

                <button
                  type="button"
                  className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <a href="../focus">Start focus</a>
                </button>
              </article>

            </section>

            {/* Today's Progress */}

            <section className="mt-6 rounded-3xl border border-border bg-surface p-7 sm:p-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                  TODAY
                </p>

                <h2 className="mt-3 text-xl font-semibold text-primary">
                  Your progress
                </h2>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                <ProgressItem
                  label="Prayer"
                  value="4 / 5"
                />

                <ProgressItem
                  label="Qur'an"
                  value="20 min"
                />

                <ProgressItem
                  label="Focus"
                  value="45 min"
                />

                <ProgressItem
                  label="Reflection"
                  value="Done"
                />
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}

function ProgressItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs text-muted">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-primary">
        {value}
      </p>
    </div>
  );
}

