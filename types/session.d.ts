// Augmenting session data object to include form errors and data
import "express-session";

declare module "express-session" {
  interface SessionData {
    formErrors?: string[];
    formData?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  }
}