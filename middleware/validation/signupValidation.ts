
import { body, ValidationChain } from "express-validator";
import prisma from "../../db/prisma";

const MAX_NAME_LENGTH = 25;
const MAX_PASSWORD_LENGTH = 72; // bcrypt truncation limit

const emptyErr = (field: string) => `${field} cannot be empty`;
const maxLengthErr = (field: string, len: number) =>
  `${field} can be at most ${len} characters long`;

const strongPasswordConfig = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

const weakPassErr = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";

export const validateSignup = (): ValidationChain[] => [
  body("firstName")
    .trim()
    .notEmpty().withMessage(emptyErr("First name"))
    .isLength({ max: MAX_NAME_LENGTH })
    .withMessage(maxLengthErr("First name", MAX_NAME_LENGTH)),

  body("lastName")
    .trim()
    .notEmpty().withMessage(emptyErr("Last name"))
    .isLength({ max: MAX_NAME_LENGTH })
    .withMessage(maxLengthErr("Last name", MAX_NAME_LENGTH)),

  body("email")
    .trim()
    .toLowerCase()
    .isEmail().withMessage("Email field not formatted properly")
    .custom(checkEmailNotInUse),

  body("password")
    .isLength({ max: MAX_PASSWORD_LENGTH })
    .withMessage(maxLengthErr("Password", MAX_PASSWORD_LENGTH))
    .isStrongPassword(strongPasswordConfig).withMessage(weakPassErr),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords must match");
    return true;
  }),
];

async function checkEmailNotInUse(value: string) {

  const user = await prisma.user.findUnique({ where: { email: value } });
  if (user) throw new Error("Email already in use");
}