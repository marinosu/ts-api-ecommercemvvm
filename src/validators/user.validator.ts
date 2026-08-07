import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().min(2, { message: "El nombre es obligatorio" }),
    lastname: z.string().min(2, { message: "El apellido es obligatorio" }),
    email: z.string().refine((val) => /\S+@\S+\.\S+/.test(val), { message: "Formato de correo no válido" }),
    phone: z.string().min(5, { message: "Minimo 5 caracteres" }),
    password: z.string().min(6, { message: "Minimo 6 caracteres" }), 
});

export const updateUserSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }).optional(),
    lastname: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }).optional(),
    phone: z.string().min(5, { message: "Minimo 5 caracteres" }).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;