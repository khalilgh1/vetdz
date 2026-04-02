import { hashAdminPassword } from "../lib/admin-password";

function printUsage() {
    console.log('Usage: npm run admin:hash-password -- "YOUR_PASSWORD"');
}

const rawPassword = process.argv[2];

if (!rawPassword) {
    printUsage();
    process.exit(1);
}

try {
    const passwordHash = hashAdminPassword(rawPassword);

    console.log("Use this value in Admin.passwordHash:");
    console.log(passwordHash);
} catch (error) {
    if (error instanceof Error && error.message === "ADMIN_PASSWORD_TOO_SHORT") {
        console.error("Password must be at least 8 characters.");
        process.exit(1);
    }

    console.error("Could not generate admin password hash.");
    process.exit(1);
}