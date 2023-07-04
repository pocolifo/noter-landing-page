import { getRuntime } from '@astrojs/cloudflare/runtime';
import type { APIRoute } from "astro";
import contactUsMetadata from "../../components/contact-us/contact-us-metadata.json"


const SAFE_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-=_+`~;:,./<>?\\|\'" \t\n\r';
const DISCORD_WEBHOOK = import.meta.env.VITE_DISCORD_CONTACT_WEBHOOK_URL;

interface Env {
    KV: KVNamespace;
}

interface TurnstileResponse {
    success: boolean;
    // ...
}

interface ContactFormSubmission {
    reasonForContact: string;
    subject: string;
    email: string;
    text: string;
}

export const post: APIRoute = async ({ request, clientAddress }) => {
    const ip = request.headers.get('CF-Connecting-IP') || clientAddress || '127.0.0.1';
    const formData = await request.formData();

    // TURNSTILE VERIFICATION
    const requestIsValid = await verifyTurnstileChallenge(
        formData.get('cf-turnstile-response') as string | null,  // TODO: make sure this is actually string | null and not another input type
        ip,
        import.meta.env.VITE_TURNSTILE_SITE_SECRET || '1x0000000000000000000000000000000AA'
    );

    if (!requestIsValid) {
        // Bad request. Did not pass Turnstile.
        return new Response('You must complete the captcha to submit the form.', { status: 400 });
    }

    try {
        // FORM SUBMISSION VALIDATION
        const submission = validateFormSubmission(formData);

        // Save email
        const runtime = getRuntime(request);
        const kv = (runtime.env as Env).KV;
    
        // Check if the user is rate limited
        if ((await kv.get(ip)) !== null) {
            // Already submitted form. Respond with too many requests.
            return new Response("In order to prevent spam, you need to wait a couple days before contacting us again.", { status: 429 });
        }
    
        try {
            await sendDiscordMessage(submission);
        } catch {
            return new Response("Sorry, we couldn't receive your message. Please try again later.", { status: 500 });
        }
    
        await kv.put(ip, '', {
            expirationTtl: 60 * 60 * 24 * (Math.random() * 7) // Seconds between submissions
        });
    
        return new Response("We've received your message, and we'll get back to you in email as soon as we can.", { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 400 })
        }

        return new Response(`Invalid form submission: please check that your email is valid, your contact reason exists, and your subject (4-128 characters) and your words (0-${contactUsMetadata.messageMaxLength} characters) both have only keyboard type-able characters.`, { status: 400 })
    }
}

async function sendDiscordMessage(submission: ContactFormSubmission) {
    await fetch(
        DISCORD_WEBHOOK,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'content': `\`\`\`From: ${submission.email}\nReason for contact: ${submission.reasonForContact}\nSubject: ${submission.subject}\n\n${submission.text}\`\`\``
            })
        }
    );
}

function validateFormSubmission(formData: FormData): ContactFormSubmission {
    //// Validate form submission
    // Contact reason
    let reasonForContact = ensureNotFile(formData, "reason-for-contact", '');
    if (!contactUsMetadata.reasons.includes(reasonForContact)) {
        throw new Error('Invalid contact reason: you chose one that doesn\'t exist.');
    }

    // Subject
    let subject = ensureStringLength(formData, 'subject', 4, 128);
    if (subject === null) {
        throw new Error('Invalid subject: your subject must be 4-128 characters and contain only the keys you can type on your keyboard.');
    }

    // Email
    // There isn't much that can be done to validate an email...
    let email = ensureStringLength(formData, 'email', 6, 254);
    if (email === null || !email.includes('@') || !email.includes('.')) {
        throw new Error('Invalid email address.');
    }

    // Text
    let text = ensureStringLength(formData, 'text', 0, contactUsMetadata.messageMaxLength);
    if (text === null) {
        throw new Error(`Invalid text you sent us: your words must be 0-${contactUsMetadata.messageMaxLength} characters and contain only the keys you can type on your keyboard.`);
    }

    return {
        reasonForContact: reasonForContact,
        subject: subject,
        email: email,
        text: text
    };
}

function ensureNotFile(formData: FormData, key: string, defaultString: string): string {
    let val = formData.get(key);

    if (val === null || val instanceof File) return defaultString;

    return val;
}

function isStringSafe(s: string): boolean {
    for (let c of s) {
        if (!SAFE_CHARACTERS.includes(c)) {
            return false;
        }
    }

    return true;
}

function ensureStringLength(formData: FormData, key: string, minLength: number, maxLength: number): string | null {
    let val = formData.get(key);

    if (val === null || val instanceof File) return null;
    if (val.length > maxLength || val.length < minLength || !isStringSafe(val)) return null;

    return val;
}

async function verifyTurnstileChallenge(token: string | null, ip: string, turnstileSecret: string) {
    if (token === null) {
        return false;
    }

    // Validate the token by calling the "/siteverify" API endpoint.
    let formData = new FormData();
    formData.append('secret', turnstileSecret);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const result = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
            body: formData,
            method: 'POST',
        }
    );

    const outcome = await result.json() as TurnstileResponse;

    if (outcome.success) {
        return true;
    }

    console.log(outcome);

    return false;
}