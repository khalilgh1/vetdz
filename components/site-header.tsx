"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Globe, Menu, Search, X } from "lucide-react";
import { type Locale, DEFAULT_LOCALE } from "@/lib/i18n";
import { type Dictionary, ar } from "@/lib/dictionaries/ar";

type SiteHeaderProps = {
    light?: boolean;
    locale?: Locale;
    dict?: Dictionary;
};

const DRAWER_ANIMATION_MS = 280;

export function SiteHeader({ light = true, locale = DEFAULT_LOCALE, dict = ar }: SiteHeaderProps) {
    const router = useRouter();
    const pathname = usePathname() || `/${locale}`;
    const searchParams = useSearchParams();
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuClosing, setMenuClosing] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const targetLocale: Locale = locale === "ar" ? "en" : "ar";

    // Build the switch URL for current page
    let switchHref: string;
    if (pathname.startsWith(`/${locale}/`)) {
        switchHref = `/${targetLocale}${pathname.slice(locale.length + 1)}`;
    } else if (pathname === `/${locale}`) {
        switchHref = `/${targetLocale}`;
    } else {
        switchHref = `/${targetLocale}${pathname}`;
    }

    const currentSearch = searchParams?.toString();
    if (currentSearch) {
        switchHref += `?${currentSearch}`;
    }

    const navLinks = [
        { href: `/${locale}`, label: dict.nav.home },
        { href: `/${locale}/catalog`, label: dict.nav.products },
        { href: `/${locale}/about`, label: dict.nav.about },
        { href: `/${locale}/contact`, label: dict.nav.contact },
    ];

    useEffect(() => {
        setMenuOpen(false);
        setMenuClosing(false);
        setSearchOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuClosing) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setMenuOpen(false);
            setMenuClosing(false);
        }, DRAWER_ANIMATION_MS);

        return () => window.clearTimeout(timeoutId);
    }, [menuClosing]);

    function openMenu() {
        setSearchOpen(false);
        setMenuClosing(false);
        setMenuOpen(true);
    }

    function closeMenu() {
        if (!menuOpen || menuClosing) {
            return;
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setMenuOpen(false);
            setMenuClosing(false);
            return;
        }

        setMenuClosing(true);
    }

    function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const query = searchValue.trim();
        setSearchOpen(false);
        router.push(
            query
                ? `/${locale}/catalog?search=${encodeURIComponent(query)}`
                : `/${locale}/catalog`
        );
    }

    return (
        <header className={`vetdz-header ${light ? "vetdz-header-light" : "vetdz-header-dark"}`}>
            <div className="vetdz-shell vetdz-header-row">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                        className="icon-btn nav-toggle"
                        aria-label="Menu"
                        onClick={() => {
                            if (menuOpen) {
                                closeMenu();
                                return;
                            }

                            openMenu();
                        }}
                        type="button"
                    >
                        <Menu size={22} />
                    </button>

                    <Link href={`/${locale}`} className="brand-title" aria-label="VetDz">
                        VETDZ
                    </Link>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {/* Language Switcher */}
                    <Link
                        href={switchHref}
                        className="lang-switch-btn"
                        aria-label={`Switch to ${targetLocale === "en" ? "English" : "العربية"}`}
                    >
                        <Globe size={16} />
                        <span>{dict.nav.switchLanguage}</span>
                    </Link>

                    <button
                        className="icon-btn"
                        aria-label={searchOpen ? "Close search" : dict.nav.searchButton}
                        onClick={() => {
                            setMenuOpen(false);
                            setMenuClosing(false);
                            setSearchOpen((value) => !value);
                        }}
                        type="button"
                    >
                        <Search size={22} />
                    </button>
                </div>
            </div>

            {searchOpen ? (
                <form className="vetdz-shell header-search" onSubmit={handleSearchSubmit} role="search">
                    <input
                        aria-label={dict.nav.searchPlaceholder}
                        className="header-search-input"
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder={dict.nav.searchPlaceholder}
                        value={searchValue}
                    />
                    <button className="header-search-submit" type="submit">
                        {dict.nav.searchButton}
                    </button>
                </form>
            ) : null}

            <nav className="vetdz-shell top-nav" aria-label="Main navigation">
                {navLinks.map((item) => (
                    <Link href={item.href} className="top-nav-link" key={item.href}>
                        {item.label}
                    </Link>
                ))}
            </nav>

            {menuOpen ? (
                <>
                    <button
                        aria-label="Close menu"
                        className={`site-drawer-backdrop${menuClosing ? " is-closing" : ""}`}
                        onClick={closeMenu}
                        type="button"
                    />

                    <aside className={`site-drawer${menuClosing ? " is-closing" : ""}`} aria-label="Sidebar Menu">
                        <div className="site-drawer-head">
                            <strong>{dict.brand}</strong>
                            <button aria-label="Close menu" className="icon-btn" onClick={closeMenu} type="button">
                                <X size={22} />
                            </button>
                        </div>

                        <nav className="site-drawer-nav">
                            {navLinks.map((item) => (
                                <Link
                                    href={item.href}
                                    className="site-drawer-link"
                                    key={item.href}
                                    onClick={closeMenu}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                            <Link
                                href={switchHref}
                                className="lang-switch-btn"
                                style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                                onClick={closeMenu}
                            >
                                <Globe size={18} />
                                <span>{dict.nav.switchLanguage}</span>
                            </Link>
                        </div>
                    </aside>
                </>
            ) : null}
        </header>
    );
}
