"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

import { auth } from "../../lib/firebase";
import ThemeToggle from "../components/ThemeToggle";

export default function Signinup() {
  const router = useRouter();

  const [mode, setMode] = useState("signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          throw new Error("Please enter your name.");
        }

        if (!email.trim()) {
          throw new Error("Please enter your email address.");
        }

        if (!password) {
          throw new Error("Please enter a password.");
        }

        if (password !== confirmPassword) {
          throw new Error("Your passwords do not match.");
        }

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });

        console.log("Mīqāt account created successfully.");

        router.push("/dashboard");
      } else {
        if (!email.trim()) {
          throw new Error("Please enter your email address.");
        }

        if (!password) {
          throw new Error("Please enter your password.");
        }

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        console.log("Signed in successfully.");

        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setError("An account already exists with this email.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Your password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-credential") {
        setError("Your email or password is incorrect.");
      } else {
        setError("Check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      setError(
        "Password reset email sent. Check your inbox or spam."
      );
    } catch (error) {
      console.error(error);

      if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account was found with this email.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left side */}
        <section className="relative hidden overflow-hidden bg-primary lg:flex">
<ThemeToggle/>
          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}
            <a
              href="/"
              className="text-sm font-medium tracking-[0.35em] text-white"
            >
              Mīqāt
            </a>

            {/* Main message */}
            <div className="max-w-lg">

              <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary-light">
                Prayer · Qur'an · Focus · Reflection
              </p>

              <h1 className="mt-6 text-5xl font-semibold leading-[1.08] tracking-tight text-white xl:text-6xl">
                Make room for what matters.
              </h1>

              <p className="mt-6 max-w-md text-base leading-8 text-primary-light">
                A calm space to help you stay connected to your worship,
                protect your attention, and live with greater intention.
              </p>

            </div>

            {/* Bottom */}
            <p className="text-xs text-primary-light">
              A calm space for prayer, Qur'an, focus and reflection.
            </p>

          </div>
        </section>

        {/* Right side */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-12 lg:hidden">

              <a
                href="/"
                className="text-sm font-medium tracking-[0.35em] text-primary"
              >
                Mīqāt
              </a>

            </div>

            {/* Heading */}
            <div>

              <p className="text-sm font-medium tracking-[0.2em] text-primary">
                {mode === "signup"
                  ? "GET STARTED"
                  : "WELCOME BACK"}
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                {mode === "signup"
                  ? "Create your Mīqāt account."
                  : "Welcome back to Mīqāt."}
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted">
                {mode === "signup"
                  ? "Start creating a more intentional relationship with your time, worship, and attention."
                  : "Continue your journey with prayer, Qur'an, focus and reflection."}
              </p>

            </div>

            {/* Switch */}
            <div className="mt-8 flex rounded-xl bg-soft p-1">

              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  mode === "signin"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  mode === "signup"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Create account
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Name */}
              {mode === "signup" && (
                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-medium tracking-wide text-muted"
                  >
                    FULL NAME
                  </label>

                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
                  />

                </div>
              )}

              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium tracking-wide text-muted"
                >
                  EMAIL ADDRESS
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
                />

              </div>

              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-xs font-medium tracking-wide text-muted"
                  >
                    PASSWORD
                  </label>

                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-primary transition-opacity hover:opacity-70"
                    >
                      Forgot password?
                    </button>
                  )}

                </div>

                <div className="relative">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      mode === "signup"
                        ? "Create a password"
                        : "Enter your password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-surface px-4 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-primary"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 15.338 6.244 18 10 18c1.39 0 2.68-.352 3.816-.973M6.228 6.228A10.451 10.451 0 0 1 10 5c3.756 0 6.774 2.662 8.066 6a10.523 10.523 0 0 1-1.041 2.208M6.228 6.228 3 3m3.228 3.228 4.715 4.715m0 0a2.25 2.25 0 0 0 3.182 3.182M17.066 17.066 21 21"
                        />
                      </svg>

                    ) : (

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 6.876 5 10.5 5c3.624 0 7.077 2.51 8.464 6a10.523 10.523 0 0 1-1.041 2.208M6.228 6.228A10.451 10.451 0 0 1 10 5c3.624 0 7.077 2.662 8.066 6a10.523 10.523 0 0 1-1.041 2.208"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                        />
                      </svg>

                    )}

                  </button>

                </div>

              </div>

              {/* Confirm password */}
              {mode === "signup" && (
                <div>

                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-xs font-medium tracking-wide text-muted"
                  >
                    CONFIRM PASSWORD
                  </label>

                  <div className="relative">

                    <input
                      id="confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      className="h-12 w-full rounded-xl border border-border bg-surface px-4 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-primary"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      {showConfirmPassword ? (

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 15.338 6.244 18 10 18c1.39 0 2.68-.352 3.816-.973M6.228 6.228A10.451 10.451 0 0 1 10 5c3.756 0 6.774 2.662 8.066 6a10.523 10.523 0 0 1-1.041 2.208M6.228 6.228 3 3m3.228 3.228 4.715 4.715m0 0a2.25 2.25 0 0 0 3.182 3.182M17.066 17.066 21 21"
                          />
                        </svg>

                      ) : (

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 6.876 5 10.5 5c3.624 0 7.077 2.51 8.464 6a10.523 10.523 0 0 1-1.041 2.208M6.228 6.228A10.451 10.451 0 0 1 10 5c3.624 0 6.774 2.662 8.066 6a10.523 10.523 0 0 1-1.041 2.208"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                          />
                        </svg>

                      )}

                    </button>

                  </div>

                </div>
              )}

              {/* Error / success message */}
            {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
                </p>
            )}

              {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 w-full rounded-xl bg-primary text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading
                ? "Please wait..."
                : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
            </button>

            </form>

            {/* Terms */}
            {mode === "signup" && (
              <p className="mt-5 text-center text-xs leading-5 text-muted">
                By creating an account, you agree to Mīqāt's terms and
                privacy policy.
              </p>
            )}

            {/* Back to marketing page */}
            <div className="mt-8 text-center">

              <a
                href="/"
                className="text-xs text-muted transition-colors hover:text-primary"
              >
                ← Back to Mīqāt
              </a>

            </div>

          </div>
        </section>

      </div>
    </main>
  );
}