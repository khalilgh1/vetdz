import Link from "next/link";
import { Menu, Search } from "lucide-react";

type SiteHeaderProps = {
    light?: boolean;
};

export function SiteHeader({ light = true }: SiteHeaderProps) {
    return (
        <header className={`vetdz-header ${light ? "vetdz-header-light" : "vetdz-header-dark"}`}>
            <div className="vetdz-shell vetdz-header-row">
                <button className="icon-btn" aria-label="القائمة" type="button">
                    <Menu size={22} />
                </button>

                <Link href="/" className="brand-title" aria-label="VetDz">
                    VETDZ
                </Link>

                <button className="icon-btn" aria-label="بحث" type="button">
                    <Search size={22} />
                </button>
            </div>

            <nav className="vetdz-shell top-nav">
                <Link href="/" className="top-nav-link">
                    الرئيسية
                </Link>
                <Link href="/about" className="top-nav-link">
                    من نحن
                </Link>
                <Link href="/contact" className="top-nav-link">
                    تواصل معنا
                </Link>
                <Link href="/orders" className="top-nav-link">
                    الطلبات
                </Link>
            </nav>
        </header>
    );
}
