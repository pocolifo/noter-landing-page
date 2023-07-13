import type { APIContext } from "astro";
import { getIpAddress } from "./utils";

interface TurnstileResponse {
    success: boolean;
    // ...
}

export async function verifyTurnstileRequest(context: APIContext, formData: FormData) {
    const ip = getIpAddress(context);

    // TURNSTILE VERIFICATION
    return await verifyTurnstileChallenge(
        formData.get('cf-turnstile-response') as string | null,  // TODO: make sure this is actually string | null and not another input type
        ip,
        import.meta.env.VITE_TURNSTILE_SITE_SECRET || /* the following is a test key for Turnstile*/ '1x0000000000000000000000000000000AA'
    );
}

export function getMeaningOfBotScore(botScore: number | undefined): string {
    if (botScore === undefined) {
        return "unknown";
    } else if (botScore > 30) {
        return "likely human";
    } else if (botScore > 2) {
        return "likely automated";
    } else if (botScore == 1) {
        return "certainly automated";
    } else {
        return "not computed";
    }
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

    return outcome.success;
}