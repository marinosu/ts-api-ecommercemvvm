import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import { UpdateUserInput } from "../validators/user.validator";

export const update = async (id: number, data: UpdateUserInput, file?: Express.Multer.File) => {
    const user = await prisma.user.findUnique({ where: { id: id } });

    if (!user) {
        throw new AppError("Usuario no encontrado", 404);
    }

    let imagePath = user.image;

    if (file) {
        imagePath = `/uploads/users/${id}/${file.filename}`;
    }

    const updatedUser = await prisma.user.update({
        where: { id: id },
        data: {
            name: data.name ?? user.name,
            lastname: data.lastname ?? user.lastname,
            phone: data.phone ?? user.phone,
            image: imagePath
        },
        include: {
            roles: {
                include: { role: true }
            }
        }
    });

    /**
     * Función para darle mejor formato de roles
     */
    const formattedRoles = updatedUser.roles.map((userRole) => ({
        id: userRole.role.id,
        name: userRole.role.name,
        route: userRole.role.route,
        image: userRole.role.image,
    }));

    /**
     * Eliminar la data password
     */
    const { password, ...userData } = updatedUser;

    return {
        ...userData,
        image: userData.image ? `http://${process.env.HOST}:${process.env.PORT}${userData.image}` : null,
        roles: formattedRoles
    }
}

/**
 * @param email Rutina para validar emails duplicados
 */
export const findByEmail = async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
}

export const findById = async (id: number) => {
    const user = await prisma.user.findUnique({ where: { id: id } });

    if (!user) {
        throw new AppError("Usuario no encontrado", 404);
    }

    /**
     * Eliminar la data password
     */
    const { password, ...userData } = user;

    return {
        ...userData,
        image: userData.image ? `http://${process.env.HOST}:${process.env.PORT}${userData.image}` : null,
    }
}