export default function ProductLoading() {
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
                {/* Product detail grid skeleton */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginBottom: "3rem" }}>
                    {/* Image carousel skeleton */}
                    <div className="skeleton-block" style={{ width: "100%", aspectRatio: "3/4", borderRadius: "var(--radius-md)" }} />

                    {/* Product info skeleton */}
                    <div style={{ paddingTop: "1rem" }}>
                        <div className="skeleton-block" style={{ width: "80%", height: "32px", marginBottom: "1rem" }} />
                        <div className="skeleton-block" style={{ width: "100%", height: "14px", marginBottom: "0.5rem" }} />
                        <div className="skeleton-block" style={{ width: "90%", height: "14px", marginBottom: "0.5rem" }} />
                        <div className="skeleton-block" style={{ width: "60%", height: "14px", marginBottom: "2rem" }} />

                        {/* Price skeleton */}
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "2rem" }}>
                            <div className="skeleton-block" style={{ width: "120px", height: "28px" }} />
                            <div className="skeleton-block" style={{ width: "80px", height: "24px" }} />
                        </div>

                        {/* Meta row skeleton */}
                        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
                            <div className="skeleton-block" style={{ width: "120px", height: "16px" }} />
                            <div className="skeleton-block" style={{ width: "100px", height: "16px" }} />
                        </div>

                        {/* Order form skeleton */}
                        <div className="skeleton-block" style={{ width: "100%", height: "48px", borderRadius: "var(--radius-md)", marginBottom: "1rem" }} />
                        <div className="skeleton-block" style={{ width: "100%", height: "48px", borderRadius: "var(--radius-md)", marginBottom: "1rem" }} />
                        <div className="skeleton-block" style={{ width: "100%", height: "52px", borderRadius: "var(--radius-full)" }} />
                    </div>
                </div>

                {/* Recommendations skeleton */}
                <div style={{ marginTop: "3rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                        <div className="skeleton-block" style={{ width: "200px", height: "24px" }} />
                        <div className="skeleton-block" style={{ width: "100px", height: "16px" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton-block" style={{ width: "100%", aspectRatio: "3/4", borderRadius: "var(--radius-md)" }} />
                                <div style={{ padding: "0.75rem 0" }}>
                                    <div className="skeleton-block" style={{ width: "70%", height: "16px", marginBottom: "0.5rem" }} />
                                    <div className="skeleton-block" style={{ width: "40%", height: "18px" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
