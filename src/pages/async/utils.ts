import { getRuntime } from "@astrojs/cloudflare/runtime";
import type { APIContext } from "astro";
import { getMeaningOfBotScore } from "./turnstile";
import Stripe from "stripe";

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

export const RATE_LIMITED_MESSAGE = "In order to prevent spam, you need to wait a little while before submitting again.";

export const STRIPE = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });


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
    
    if (val.length > maxLength || val.length < minLength || !isStringSafe(val)) throw new Error(`Invalid ${formatKey(key)}: it must be ${minLength}-${maxLength} of characters that can be typed on a United States English keyboard.`);

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

export async function checkRateLimit(context: APIContext) {
    const ip = getIpAddress(context);
    const runtime = getRuntime(context.request);
    const kv = (runtime.env as Env).KV;

    // Check if the user is rate limited
    if ((await kv.get(ip)) !== null) {
        // Already submitted form. Respond with too many requests.
        throw new Error(RATE_LIMITED_MESSAGE);
    }
}

export async function rateLimit(context: APIContext, seconds: number) {
    const ip = getIpAddress(context);
    const runtime = getRuntime(context.request);
    const kv = (runtime.env as Env).KV;

    await kv.put(ip, '', {
        expirationTtl: seconds // Seconds between submissions
    });
}

export function getBotScoreString(context: APIContext): string {
    const runtime = getRuntime(context.request);
    const score = runtime.cf?.botManagement.score;

    return `Bot Score: ${score} [${getMeaningOfBotScore(score)}]`
}

// Stripe
export interface StripeNoterPlan {
    product: Stripe.Product;
    price: Stripe.Price;
}

export async function getPlans(currency: string) {
    const prices = await STRIPE.prices.list({
        expand: ['data.product'],
        currency: currency,
        active: true,
        lookup_keys: ['noter_premium_monthly', 'noter_premium_yearly']
    });

    let plans = [];

    for (let price of prices.data) {
        let product: Stripe.Product;
    
        if (typeof price.product === "string") {
            product = await STRIPE.products.retrieve(price.product);
        } else {
            product = price.product as Stripe.Product;
        }
    
        let plan: StripeNoterPlan = {
            price: price,
            product: product
        }
    
        plans.push(plan);
    }

    return plans;
}