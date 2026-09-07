export default function OrdersLoading() {
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

            <main className="vetdz-shell orders-page" style={{ paddingTop: "5rem" }}>
                {/* Hero skeleton */}
                <div className="orders-hero" style={{ marginBottom: "2rem" }}>
                    <div className="skeleton-block" style={{ width: "120px", height: "16px", marginBottom: "0.5rem" }} />
                    <div className="skeleton-block" style={{ width: "260px", height: "36px", marginBottom: "0.75rem" }} />
                    <div className="skeleton-block" style={{ width: "380px", maxWidth: "90%", height: "16px" }} />
                </div>

                {/* Product pills selector skeleton */}
                <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "1rem", marginBottom: "2rem" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="skeleton-block"
                            style={{ width: "110px", height: "40px", borderRadius: "9999px", flexShrink: 0 }}
                        />
                    ))}
                </div>

                {/* Order form card skeleton */}
                <div style={{
                    maxWidth: "600px",
                    margin: "0 auto",
                    padding: "2rem",
                    borderRadius: "var(--radius-lg, 16px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(255, 255, 255, 0.02)"
                }}>
                    <div className="skeleton-block" style={{ width: "180px", height: "24px", marginBottom: "1.5rem" }} />
                    <div className="skeleton-block" style={{ width: "100%", height: "48px", borderRadius: "8px", marginBottom: "1rem" }} />
                    <div className="skeleton-block" style={{ width: "100%", height: "48px", borderRadius: "8px", marginBottom: "1rem" }} />
                    <div className="skeleton-block" style={{ width: "100%", height: "48px", borderRadius: "8px", marginBottom: "1.5rem" }} />
                    <div className="skeleton-block" style={{ width: "100%", height: "52px", borderRadius: "9999px" }} />
                </div>
            </main>
        </div>
    );
}
