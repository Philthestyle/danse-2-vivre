import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z.string().min(1, "Prénom requis").max(80),
    lastName: z.string().min(1, "Nom requis").max(80),
    email: z.string().email("Email invalide"),
    emailConfirm: z.string().email(),
    password: z
      .string()
      .min(10, "Au moins 10 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[a-z]/, "Au moins une minuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    passwordConfirm: z.string(),
    pack: z.enum(["classique", "village"], {
      message: "Choisissez un forfait",
    }),
    cityId: z.string().uuid().nullable().optional(),
  })
  .refine((v) => v.email === v.emailConfirm, {
    message: "Les emails ne correspondent pas",
    path: ["emailConfirm"],
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
  })
  .refine((v) => v.pack !== "classique" || !!v.cityId, {
    message: "Le forfait Classique exige de choisir une ville",
    path: ["cityId"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type SigninInput = z.infer<typeof signinSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(10, "Au moins 10 caractères"),
    passwordConfirm: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
  });
