import type { APIRoute } from "astro";
import { verifyTurnstileRequest } from './turnstile';
import { API_URL, EXPIRED_TURNSTILE_RESPONSE, LOGIN_NAMESPACE, LOGIN_RATE_TOLERANCE, checkRateLimit, ensureEmail, ensureGoodPassword, rateLimit } from './utils';

interface UserFormSubmission {
    email: string;
    password: string;
}

export const post: APIRoute = async ctx => {
    const formData = await ctx.request.formData();

    // TURNSTILE VERIFICATION
    if (!await verifyTurnstileRequest(ctx, formData)) {
        // Bad request. Did not pass Turnstile.
        return EXPIRED_TURNSTILE_RESPONSE();
    }
    
    try {
        await checkRateLimit(ctx, LOGIN_NAMESPACE, LOGIN_RATE_TOLERANCE);
        const submission = validateFormSubmission(formData);
        
        try {
            const signInResponse = await sendSignInRequest(submission);
            
            switch (signInResponse.status) {
                case 200:
                    const data = await signInResponse.json();
                    const authenticated: boolean = data['authenticated'];

                    await rateLimit(ctx, LOGIN_NAMESPACE, 60 + 60 * Math.random());

                    if (authenticated) {
                        return new Response(null, {
                            status: 204,
                            headers: signInResponse.headers
                        });
                    } else {
                        return new Response("The credentials you provided are incorrect.", {
                            status: 401,
                            headers: signInResponse.headers
                        });
                    }

                default:
                    return new Response("An error occurred on our end. Please try again later!", { status: 500 });
            }
        } catch (e) {
            console.error(e)
            return new Response("Sorry, there was an error. Please try again later.", { status: 500 });
        }
    
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 400 })
        }

        return new Response("Invalid form submission.", { status: 400 })
    }
}

async function sendSignInRequest(submission: UserFormSubmission): Promise<Response> {
    return await fetch(
        `${API_URL}/authenticate`,
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
    return {
        email: ensureEmail(formData, 'email'),
        password: ensureGoodPassword(formData, 'password')
    };
}
