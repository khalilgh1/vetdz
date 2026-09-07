export default function CatalogLoading() {
    return (
        <div className="loading-skeleton-page">
            {/* Header skeleton */}
            <div className="skeleton-header">
                <div className="vetdz-shell" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBlock: "1.15rem" }}>
                    <div className="skeleton-block" style={{ width: "100px", height: "22px" }} />
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <div className="skeleton-block" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
                        <div className="skeleton-block" style={{ width: "60px", height: "24px" }} />
                    </div>
                </div>
            </div>

            <main className="vetdz-shell" style={{ paddingTop: "6rem" }}>
                {/* Hero box skeleton */}
                <div className="skeleton-hero-box">
                    <div className="skeleton-block" style={{ width: "120px", height: "14px", marginBottom: "0.75rem" }} />
                    <div className="skeleton-block" style={{ width: "280px", height: "32px", marginBottom: "0.5rem" }} />
                    <div className="skeleton-block" style={{ width: "220px", height: "14px" }} />
                </div>

                {/* Filter chips skeleton */}
                <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-block" style={{ width: "80px", height: "38px", borderRadius: "var(--radius-full)" }} />
                    ))}
                </div>

                {/* Type grid skeleton */}
                <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-block" style={{ width: "100px", height: "70px", borderRadius: "var(--radius-md)" }} />
                    ))}
                </div>

                {/* Section header skeleton */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2.5rem", marginBottom: "1.25rem" }}>
                    <div className="skeleton-block" style={{ width: "140px", height: "24px" }} />
                    <div className="skeleton-block" style={{ width: "80px", height: "16px" }} />
                </div>

                {/* Product grid skeleton */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-block" style={{ width: "100%", aspectRatio: "3/4", borderRadius: "var(--radius-md)" }} />
                            <div style={{ padding: "0.75rem 0" }}>
                                <div className="skeleton-block" style={{ width: "70%", height: "16px", marginBottom: "0.5rem" }} />
                                <div className="skeleton-block" style={{ width: "50%", height: "14px", marginBottom: "0.5rem" }} />
                                <div className="skeleton-block" style={{ width: "40%", height: "18px" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
