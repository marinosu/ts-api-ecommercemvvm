import bcrypt from "bcryptjs";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import { LoginInput } from "../validators/auth.validator";
import { generateToken } from "../config/jwt";
import type { CreateUserInput } from "../validators/user.validator";

/**
 * @param data Rutina para crear un usuario
 */
export const register = async (data: CreateUserInput) => {
    const { name, lastname, email, phone, password } = data;

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: name,
                lastname: lastname,
                email: email,
                phone: phone,
                password: hashedPassword,
            }
        });

        const clientRole = await tx.role.findUnique({
            where: { id: "CLIENT" }
        });

        if (!clientRole) {
            throw new AppError("El rol del cliente no existe", 404);
        }

        await tx.userHasRole.create({
            data: {
                id_user: user.id,
                id_rol: clientRole.id
            }
        });

        /**
         * Token de sesión
         */
        const token = generateToken({
            id: user.id,
            email: user.email
        });

        return {
            token: `Bearer ${token}`,
            user: {
                id: user.id,
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                image: user.image,
                notification_token: user.notification_token,
                roles: [
                    {
                        id: clientRole.id,
                        name: clientRole.name,
                        route: clientRole.route,
                        image: clientRole.image,
                    }
                ]
            }
        }
    });

    return result;
}

export const loginUser = async (data: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: {email: data.email},
        /**
         * Agregar todas las propiedades que están en la tabla role
         */
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });

    if (!user) {
        throw new AppError("Usuario no encontrado", 404);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
        throw new AppError("Contraseña incorrecta", 401);
    }

    /**
     * Token de sesión
     */
    const token = generateToken({
        id: user.id,
        email: user.email
    });

    /**
     * Eliminar la data password
     */
    const { password, roles, ...userData } = user;

    /**
     * Función para darle mejor formato de roles
     */
    const formattedRoles = roles.map((userRole) => ({
        id: userRole.role.id,
        name: userRole.role.name,
        route: userRole.role.route,
        image: userRole.role.image,
    }));

    return {
        "token": `Bearer ${token}`,
        "user": {
            ...userData,
            image: userData.image ? `http://${process.env.HOST}:${process.env.PORT}${userData.image}` : null,
            roles: formattedRoles
        }
    }
}