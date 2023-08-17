import type { APIRoute } from "astro";
import contactUsMetadata from "../../resources/contact-us-metadata.json";
import { verifyTurnstileRequest } from './turnstile';
import { CONTACT_NAMESPACE, CONTACT_RATE_TOLERANCE, EXPIRED_TURNSTILE_RESPONSE, checkRateLimit, ensureEmail, ensureOption, ensureStringLength, getBotScoreString, getIpAddress, rateLimit, sendDiscordMessage } from './utils';


interface ContactFormSubmission {
    reasonForContact: string;
    subject: string;
    email: string;
    text: string;
}

export const post: APIRoute = async ctx => {
    const formData = await ctx.request.formData();

    // TURNSTILE VERIFICATION
    if (!await verifyTurnstileRequest(ctx, formData)) {
        // Bad request. Did not pass Turnstile.
        return EXPIRED_TURNSTILE_RESPONSE();
    }

    try {
        const submission = validateFormSubmission(formData);        
        await checkRateLimit(ctx, CONTACT_NAMESPACE, CONTACT_RATE_TOLERANCE);
    
        try {
            await sendDiscordMessage(`\`\`\`
IP Address: ${getIpAddress(ctx)}
Bot Score: ${getBotScoreString(ctx)}
From: ${submission.email}
Reason for contact: ${submission.reasonForContact}
Subject: ${submission.subject}

${submission.text}
\`\`\``);
        } catch (e) {
            console.error(e)
            return new Response("Sorry, we couldn't receive your message. Please try again later.", { status: 500 });
        }
    
        await rateLimit(ctx, CONTACT_NAMESPACE, 60 * 60 * 24 * 7 * Math.random());
        return new Response("We've received your message, and we'll get back to you in email as soon as we can.", { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 400 })
        }

        return new Response(`Invalid form submission: please check that your email is valid, your contact reason exists, and your subject (4-128 characters) and your words (0-${contactUsMetadata.messageMaxLength} characters) both have only keyboard type-able characters.`, { status: 400 })
    }
}

function validateFormSubmission(formData: FormData): ContactFormSubmission {
    return {
        reasonForContact: ensureOption(formData, 'reason-for-contact', contactUsMetadata.reasons),
        subject: ensureStringLength(formData, 'subject', 4, 128),
        email: ensureEmail(formData, 'email'),
        text: ensureStringLength(formData, 'text', 0, contactUsMetadata.messageMaxLength)
    };
}
