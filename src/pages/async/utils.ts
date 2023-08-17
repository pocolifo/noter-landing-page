import { getRuntime } from "@astrojs/cloudflare/runtime";
import type { APIContext } from "astro";
import { getMeaningOfBotScore } from "./turnstile";

// Constants
const DISCORD_WEBHOOK = import.meta.env.VITE_DISCORD_CONTACT_WEBHOOK_URL;
export const API_URL = import.meta.env.VITE_API_URL;

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 256;
const MIN_EMAIL_LENGTH = 'a@a.co'.length;
const MAX_EMAIL_LENGTH = 254;

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SYMBOLS = '!@#$%^&*()-=_+`~;:,./<>?\\|\'"';
const NUMBERS = '0123456789';
const PRINTABLE = " \t\n\r";
const SAFE_CHARACTERS = ALPHABET + SYMBOLS + NUMBERS + PRINTABLE;

export const REGISTRATION_NAMESPACE = "registration";
export const REGISTRATION_RATE_TOLERANCE = 3;
export const LOGIN_NAMESPACE = "login";
export const LOGIN_RATE_TOLERANCE = 5;
export const CONTACT_NAMESPACE = "contact";
export const CONTACT_RATE_TOLERANCE = 1;

export const RATE_LIMITED_MESSAGE = "In order to prevent spam, you need to wait a little while before submitting again.";

export const EXPIRED_TURNSTILE_RESPONSE = () => new Response(
    'The captcha has expired. Please refresh and retry.',
    {
        status: 400,
        headers: {
            'X-GetNoter-Turnstile': 'refresh'
        }
    }
);


// Miscellaneous
export async function sendDiscordMessage(message: string) {
    await fetch(
        DISCORD_WEBHOOK,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'content': message
            })
        }
    );
}

// Validation
function formatKey(key: string) {
    return key.replaceAll('-', ' ');
}

function isStringSafe(s: string): boolean {
    for (let c of s) {
        if (!SAFE_CHARACTERS.includes(c)) {
            return false;
        }
    }

    return true;
}

export function ensureNotFile(formData: FormData, key: string): string {
    let val = formData.get(key);

    if (val === null || val instanceof File) throw new Error(`Invalid ${formatKey(key)}: it cannot be a file`);

    return val;
}

export function ensureStringLength(formData: FormData, key: string, minLength: number, maxLength: number): string {
    let val = ensureNotFile(formData, key);
    
    if (val.length > maxLength || val.length < minLength || !isStringSafe(val)) throw new Error(`${formatKey(key)} must be ${minLength}-${maxLength} of characters that can be typed on a United States English keyboard.`);

    return val;
}

export function ensureEmail(formData: FormData, key: string): string {
    let email = ensureStringLength(formData, key, MIN_EMAIL_LENGTH, MAX_EMAIL_LENGTH);
    
    if (email === null || !email.includes('@') || !email.includes('.') || email.includes(' ')) {
        throw new Error(`Invalid ${formatKey(key)}: it must be a proper email address.`);
    }

    return email;
}

export function ensureOption(formData: FormData, key: string, options: string[]): string {
    let s = ensureNotFile(formData, "reason-for-contact");

    if (!options.includes(s)) {
        throw new Error(`Invalid ${formatKey(key)}: the option you chose doesn't exist.`);
    }

    return s;
}

export function ensureGoodPassword(formData: FormData, key: string): string {
    let s = ensureStringLength(formData, key, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH);
    let alphabet, symbols, numbers;

    for (let c of s) {
        if (ALPHABET.includes(c)) alphabet = true;
        if (SYMBOLS.includes(c)) symbols = true;
        if (NUMBERS.includes(c)) numbers = true;

        if (alphabet && symbols && numbers) return s;
    }

    if (!alphabet) throw new Error('Password must contain an alphabetical character.');
    if (!symbols) throw new Error(`Password must contain a symbol (one of ${SYMBOLS}).`);
    if (!numbers) throw new Error(`Password must contain a number.`);

    return s;
}

// Rate limiting
interface Env {
    KV: KVNamespace;
}

export function getIpAddress(context: APIContext) {
    return context.request.headers.get('CF-Connecting-IP') || context.clientAddress || '127.0.0.1';
}

export async function checkRateLimit(context: APIContext, namespace: string, tolerance: number) {
    const ip = getIpAddress(context);
    const runtime = getRuntime(context.request);
    const kv = (runtime.env as Env).KV;
    const key = `${ip}:${namespace}`;
    const requestCount = Number(await kv.get(key));

    // Check if the user is rate limited
    if (requestCount > tolerance) {
        // Already submitted form. Respond with too many requests.
        throw new Error(RATE_LIMITED_MESSAGE);
    }
}

export async function rateLimit(context: APIContext, namespace: string, resetSeconds: number) {
    const ip = getIpAddress(context);
    const runtime = getRuntime(context.request);
    const kv = (runtime.env as Env).KV;
    const key = `${ip}:${namespace}`;
    const newRequestCount = Number(await kv.get(key)) + 1;

    await kv.put(`${ip}:${namespace}`, `${newRequestCount}`, {
        expirationTtl: resetSeconds // Seconds between submissions
    });
}

export function getBotScoreString(context: APIContext): string {
    const runtime = getRuntime(context.request);
    const score = runtime.cf?.botManagement.score;

    return `Bot Score: ${score} [${getMeaningOfBotScore(score)}]`
}

// Stripe
export interface NoterPlan {
    id: string;
    price: string | null;
    period: string | null;
    features: string[];
}

export async function getPlans(): Promise<Record<string, NoterPlan>> {
    return await (await fetch(`${API_URL}/stripe/plans`)).json();
}