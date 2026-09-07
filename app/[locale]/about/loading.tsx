export default function AboutLoading() {
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

            <main style={{ paddingTop: "5rem" }}>
                {/* Hero skeleton */}
                <div className="skeleton-hero-box" style={{ textAlign: "center", padding: "4rem 2rem" }}>
                    <div className="skeleton-block" style={{ width: "250px", height: "36px", margin: "0 auto 1rem" }} />
                    <div className="skeleton-block" style={{ width: "400px", maxWidth: "90%", height: "16px", margin: "0 auto" }} />
                </div>

                {/* Story section skeleton */}
                <div className="vetdz-shell" style={{ paddingBlock: "3rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
                        <div className="skeleton-block" style={{ width: "100%", aspectRatio: "4/3", borderRadius: "var(--radius-md)" }} />
                        <div>
                            <div className="skeleton-block" style={{ width: "200px", height: "28px", marginBottom: "1rem" }} />
                            <div className="skeleton-block" style={{ width: "100%", height: "14px", marginBottom: "0.5rem" }} />
                            <div className="skeleton-block" style={{ width: "90%", height: "14px", marginBottom: "0.5rem" }} />
                            <div className="skeleton-block" style={{ width: "80%", height: "14px" }} />
                        </div>
                    </div>
                </div>

                {/* Testimonials section skeleton */}
                <div className="vetdz-shell" style={{ paddingBlock: "3rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <div className="skeleton-block" style={{ width: "200px", height: "28px", margin: "0 auto 0.75rem" }} />
                        <div className="skeleton-block" style={{ width: "350px", maxWidth: "90%", height: "16px", margin: "0 auto" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="skeleton-card" style={{ padding: "1.5rem" }}>
                                <div className="skeleton-block" style={{ width: "100px", height: "14px", marginBottom: "1rem" }} />
                                <div className="skeleton-block" style={{ width: "100%", height: "14px", marginBottom: "0.5rem" }} />
                                <div className="skeleton-block" style={{ width: "85%", height: "14px", marginBottom: "0.5rem" }} />
                                <div className="skeleton-block" style={{ width: "70%", height: "14px", marginBottom: "1.5rem" }} />
                                <div className="skeleton-block" style={{ width: "120px", height: "16px" }} />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
