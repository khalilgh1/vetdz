"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

type SiteHeaderProps = {
    light?: boolean;
};

const NAV_LINKS = [
    { href: "/", label: "الرئيسية" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "تواصل معنا" },
];

export function SiteHeader({ light = true }: SiteHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        setMenuOpen(false);
        setSearchOpen(false);
    }, [pathname]);

    function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const query = searchValue.trim();
        setSearchOpen(false);
        router.push(query ? `/catalog?search=${encodeURIComponent(query)}` : "/catalog");
    }

    return (
        <header className={`vetdz-header ${light ? "vetdz-header-light" : "vetdz-header-dark"}`}>
            <div className="vetdz-shell vetdz-header-row">
                <button
                    className="icon-btn nav-toggle"
                    aria-label="القائمة"
                    onClick={() => {
                        setSearchOpen(false);
                        setMenuOpen((value) => !value);
                    }}
                    type="button"
                >
                    <Menu size={22} />
                </button>

                <Link href="/" className="brand-title" aria-label="VetDz">
                    VETDZ
                </Link>

                <button
                    className="icon-btn"
                    aria-label={searchOpen ? "إغلاق البحث" : "بحث"}
                    onClick={() => {
                        setMenuOpen(false);
                        setSearchOpen((value) => !value);
                    }}
                    type="button"
                >
                    <Search size={22} />
                </button>
            </div>

            {searchOpen ? (
                <form className="vetdz-shell header-search" onSubmit={handleSearchSubmit} role="search">
                    <input
                        aria-label="ابحث عن منتج"
                        className="header-search-input"
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="ابحث عن منتج"
                        value={searchValue}
                    />
                    <button className="header-search-submit" type="submit">
                        بحث
                    </button>
                </form>
            ) : null}

            <nav className="vetdz-shell top-nav" aria-label="القائمة الرئيسية">
                {NAV_LINKS.map((item) => (
                    <Link href={item.href} className="top-nav-link" key={item.href}>
                        {item.label}
                    </Link>
                ))}
            </nav>

            {menuOpen ? (
                <>
                    <button
                        aria-label="إغلاق القائمة"
                        className="site-drawer-backdrop"
                        onClick={() => setMenuOpen(false)}
                        type="button"
                    />

                    <aside className="site-drawer" aria-label="القائمة الجانبية">
                        <div className="site-drawer-head">
                            <strong>القائمة</strong>
                            <button aria-label="إغلاق القائمة" className="icon-btn" onClick={() => setMenuOpen(false)} type="button">
                                <X size={22} />
                            </button>
                        </div>

                        <nav className="site-drawer-nav">
                            {NAV_LINKS.map((item) => (
                                <Link href={item.href} className="site-drawer-link" key={item.href} onClick={() => setMenuOpen(false)}>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                </>
            ) : null}
        </header>
    );
}
