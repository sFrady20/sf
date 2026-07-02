export const IS_PROD = process.env.NODE_ENV === "production";

//first real gig was 2014 (see data/experience.ts), one source of truth
export const CAREER_START_YEAR = 2014;
export const yearsOfExperience = () =>
  new Date().getFullYear() - CAREER_START_YEAR;
export const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY || "";
export const CAST_APP_ID = "06B78D7C";
export const CAST_NAMESPACE = "com.frady.steven";
