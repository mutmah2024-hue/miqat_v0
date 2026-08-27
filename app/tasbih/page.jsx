"use client";

import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../lib/firebase";

export default function Tasbīh() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="flex min-h-screen">
                <Sidebar user={user} />

                <ThemeToggle />

                <div className="min-w-0 flex-1">
                    <div className="flex min-h-screen items-center justify-center px-6 py-10">
                        <div className="w-full max-w-lg text-center">

                            

                            <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-muted">
                                Tasbīh
                            </p>

                            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                                Coming soon
                            </h1>

                            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">
                                Tasbīh is on its way.
                            </p>

                            <div className="mt-8 inline-flex rounded-xl bg-soft px-5 py-3 text-sm font-medium text-primary">
                                Available soon
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}