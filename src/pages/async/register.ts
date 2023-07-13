import type { APIRoute } from "astro";
import { verifyTurnstileRequest } from './turnstile';
import { API_URL, checkRateLimit, ensureEmail, ensureGoodPassword, ensureNotFile, getBotScoreString, getIpAddress, rateLimit, sendDiscordMessage } from './utils';

interface UserFormSubmission {
    email: string;
    password: string;
}

export const post: APIRoute = async ctx => {
    const formData = await ctx.request.formData();

    // TURNSTILE VERIFICATION
    if (!verifyTurnstileRequest(ctx, formData)) {
        // Bad request. Did not pass Turnstile.
        return new Response('The captcha has expired. Please refresh and retry.', { status: 400 });
    }

    try {
        await checkRateLimit(ctx);
        const submission = validateFormSubmission(formData);        
    
        try {
            const signUpResponse = await sendSignUpRequest(submission);

            if (signUpResponse.status === 400) {
                return new Response("Sorry, but a user with that email already exists.", { status: 400 });
            }

            await sendDiscordMessage(`
@everyone :partying_face: NEW USER!

\`\`\`
IP Address: ${getIpAddress(ctx)}
Bot Score: ${getBotScoreString(ctx)}
User Email: ${submission.email}
Server Response:

${await signUpResponse.text()}
\`\`\``);

            await rateLimit(ctx, 60 * 60 * Math.random());
            return new Response("You're almost there! Please click the link we sent to your email address to verify it.", {
                status: 200,
                headers: signUpResponse.headers
            });
        } catch (e) {
            console.error(e)
            return new Response("Sorry, there was an error. Please try again later.", { status: 500 });
        }
    
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 400 })
        }

        return new Response(`Invalid form submission.`, { status: 400 })
    }
}

async function sendSignUpRequest(submission: UserFormSubmission): Promise<Response> {
    return await fetch(
        `${API_URL}/items/create/user`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'email': submission.email,
                'password': submission.password
            })
        }
    );
}

function validateFormSubmission(formData: FormData): UserFormSubmission {
    if (ensureNotFile(formData, 'password') !== ensureNotFile(formData, 'confirm-password')) {
        throw new Error('Passwords do not match, but they must match.');
    }

    return {
        email: ensureEmail(formData, 'email'),
        password: ensureGoodPassword(formData, 'password')
    };
}
