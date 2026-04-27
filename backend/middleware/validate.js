import z from "zod";

// handles malicious users and controls the incoming username
// and password length
export const signupSchema = z.object({
  username: z.string().min(3).max(20).trim(),
  password: z.string().min(6),
});

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.errors.map((e) => e.message),
    });
  }
  // if everything alright then move towards next line in the
  // signup function
  next();
};
