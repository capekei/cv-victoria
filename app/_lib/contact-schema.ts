import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Your name is needed").max(100),
  email: z.email("A valid email is needed"),
  message: z.string().min(10, "Tell me a bit more").max(2000),
});

export type ContactData = z.infer<typeof contactSchema>;
