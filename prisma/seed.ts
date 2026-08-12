import { prisma } from "../src/database/prismaClient";

/**
 * Ese seed es para el Github Actions
 */
const roles = [
    {
        id: "ADMIN",
        name: "Admin",
        image: "https://cdn-icons-png.flaticon.com/512/2206/2206368.png",
        route: "/admin/home",
    },
    {
        id: "CLIENT",
        name: "Cliente",
        image: "https://cdn-icons-png.flaticon.com/512/6009/6009864.png",
        route: "/client/home",
    },
    {
        id: "DRIVER",
        name: "Conductor",
        image: "https://png.pngtree.com/png-clipart/20220911/original/pngtree-driver-man-png-image_8550195.png",
        route: "/driver/home",
    },
];

/**
 * Seed para poder crear el dato cliente
 */
async function main() {
    console.log("🌱 Ejecutando seed...");

    for (const role of roles) {
        await prisma.role.upsert({
            where: {
                id: role.id,
            },
            update: {},
            create: role,
        });

        console.log(`✅ Rol ${role.id} creado/verificado`);
    }

    console.log("🌱 Seed finalizado");
}

main()
    .catch((error) => {
        console.error("❌ Error ejecutando seed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });