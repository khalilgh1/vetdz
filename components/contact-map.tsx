"use client";

/**
 * ContactMap component - Displays an embedded OpenStreetMap showing VetDz location in Algiers
 * Uses an iframe to embed an open-source map with a marker at the store address
 */
export function ContactMap() {
    return (
        <div className="contact-map-container">
            <iframe
                width="100%"
                height="500"
                style={{
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                src="https://www.openstreetmap.org/export/embed.html?bbox=3.050513267517091%2C36.76200766307323%2C3.069126235485077%2C36.77149066435019&layer=mapnik&marker=36.76674916371171%2C3.0598197565435984"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <p className="map-info">شارع ديدوش مراد، الجزائر العاصمة 16000 - الجزائر</p>
        </div>
    );
}
