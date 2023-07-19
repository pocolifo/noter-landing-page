import type { APIRoute } from "astro";
import { verifyTurnstileRequest } from './turnstile';
import { API_URL, RATE_LIMITED_MESSAGE, getIpAddress } from './utils';

export const post: APIRoute = async ctx => {
    const formData = await ctx.request.formData();

    // TURNSTILE VERIFICATION
    if (!verifyTurnstileRequest(ctx, formData)) {
        // Bad request. Did not pass Turnstile.
        return new Response('The captcha has expired. Please refresh and retry.', { status: 400 });
    }
    
    try {
        const cookie = ctx.request.headers.get('Cookie')

        if (cookie === null) {
            return new Response("Sorry, but you're not allowed to resend a verification email since you're not signed in.", { status: 400 });
        }
    
        try {
            const resendResponse = await sendResendEmailRequest(
                cookie,
                getIpAddress(ctx)
            );

            if (resendResponse.status === 200) {
                return new Response("We've resent you the verification email. Check your inbox.", { status: 200 });
            } else if (resendResponse.status === 429) {
                return new Response(RATE_LIMITED_MESSAGE, { status: 429 });
            } else {       
                return new Response("Sorry, there was an error. Please try again later.", { status: 500 });
            }
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

async function sendResendEmailRequest(cookie: string, clientIp: string): Promise<Response> {
    return await fetch(
        `${API_URL}/resend-verification`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie,
                'X-Client-IP': clientIp
            }
        }
    );
}
