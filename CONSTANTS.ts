// Used to store any string constants we needs to share with all of the files
import path from "path";

export const NITRO_QA_URL = "https://nitroqa.powerhrg.com";
export const NITRO_ID_LOGIN = "https://id.powerhrg.com/login";
const ROOT_DIR = path.resolve(__dirname, '..');
export const SESSION_FILE = path.resolve(ROOT_DIR, "session.json");