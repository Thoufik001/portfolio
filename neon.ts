import { defineConfig } from "@neon/config/v1";

function requiredSecret(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required. Deploy with --env neon/.env.`);
  return value;
}

export default defineConfig({
  functions: {
    contact: {
      name: "Portfolio contact",
      source: "./neon/functions/contact/index.ts",
      env: {
        RESEND_API_KEY: requiredSecret("RESEND_API_KEY"),
        CONTACT_FROM: requiredSecret("CONTACT_FROM"),
      },
    },
    activity: {
      name: "Portfolio activity",
      source: "./neon/functions/activity/index.ts",
      env: {
        ACTIVITY_USERNAME: requiredSecret("ACTIVITY_USERNAME"),
        ACTIVITY_PASSWORD_HASH: requiredSecret("ACTIVITY_PASSWORD_HASH"),
        ACTIVITY_SESSION_SECRET: requiredSecret("ACTIVITY_SESSION_SECRET"),
      },
    },
  },
});
