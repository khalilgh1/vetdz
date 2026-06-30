"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { UiProduct } from "@/lib/store";

type ProductFeedProps = {
    initialItems: UiProduct[];
    initialHasMore: boolean;
    initialNextPage: number | null;
    query: Record<string, string | undefined>;
};

function buildUrl(page: number, query: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "8");

    for (const [key, value] of Object.entries(query)) {
        if (value) {
            params.set(key, value);
        }
    }

    return `/api/products?${params.toString()}`;
}

export function ProductFeed({ initialItems, initialHasMore, initialNextPage, query }: ProductFeedProps) {
    const [items, setItems] = useState(initialItems);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [nextPage, setNextPage] = useState(initialNextPage);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;

        if (!sentinel || !hasMore || nextPage === null) {
            return;
        }

        const observer = new IntersectionObserver(
            async (entries) => {
                const entry = entries[0];

                if (!entry?.isIntersecting || loading) {
                    return;
                }

                setLoading(true);

                try {
                    const response = await fetch(buildUrl(nextPage, query));
                    if (!response.ok) {
                        return;
                    }

                    const payload = (await response.json()) as {
                        items: UiProduct[];
                        hasMore: boolean;
                        nextPage: number | null;
                    };

                    setItems((current) => [...current, ...payload.items]);
                    setHasMore(payload.hasMore);
                    setNextPage(payload.nextPage);
                } finally {
                    setLoading(false);
                }
            },
            { rootMargin: "500px 0px" },
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [hasMore, loading, nextPage, query]);

    useEffect(() => {
        setItems(initialItems);
        setHasMore(initialHasMore);
        setNextPage(initialNextPage);
    }, [initialItems, initialHasMore, initialNextPage]);

    return (
        <>
            <div className="product-grid">
                {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <div ref={sentinelRef} className="load-sentinel" aria-hidden="true" />

            {loading ? <p className="load-more-state">جار تحميل المزيد...</p> : null}
            {!hasMore ? <p className="load-more-state">تم عرض كل المنتجات المميزة.</p> : null}
        </>
    );
}