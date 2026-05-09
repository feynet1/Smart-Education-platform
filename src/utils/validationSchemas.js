import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const GRADES = [
    '1', '2', '3', '4', '5', '6', '7', '8',
    '9', '10', '11', '12', 'University',
];

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
    role: z.enum(['Student', 'Teacher'], {
        errorMap: () => ({ message: "Please select a role" }),
    }),
    grade: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
}).refine((data) => {
    if (data.role === 'Student') return GRADES.includes(data.grade ?? '');
    return true;
}, {
    message: "Please select your grade",
    path: ["grade"],
});

export { GRADES };
