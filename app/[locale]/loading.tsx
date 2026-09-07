export default function Loading() {
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

            {/* Hero skeleton */}
            <div className="skeleton-hero">
                <div className="skeleton-block" style={{ width: "60%", maxWidth: "400px", height: "16px", marginBottom: "1rem" }} />
                <div className="skeleton-block" style={{ width: "80%", maxWidth: "600px", height: "40px", marginBottom: "0.75rem" }} />
                <div className="skeleton-block" style={{ width: "70%", maxWidth: "500px", height: "40px", marginBottom: "1.5rem" }} />
                <div className="skeleton-block" style={{ width: "50%", maxWidth: "350px", height: "18px", marginBottom: "2rem" }} />
                <div className="skeleton-block" style={{ width: "180px", height: "48px", borderRadius: "var(--radius-full)" }} />
            </div>

            {/* Content sections skeleton */}
            <div className="vetdz-shell" style={{ paddingBlock: "3rem" }}>
                {/* Section header */}
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div className="skeleton-block" style={{ width: "200px", height: "28px", margin: "0 auto 0.75rem" }} />
                    <div className="skeleton-block" style={{ width: "300px", height: "16px", margin: "0 auto" }} />
                </div>

                {/* Cards grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
                    {Array.from({ length: 4 }).map((_, i) => (
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
            </div>
        </div>
    );
}
