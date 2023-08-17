import { defineMiddleware } from 'astro/middleware';
import { API_URL } from './pages/async/utils';

export const  onRequest = defineMiddleware(async (ctx, next) => {
    const response = await fetch(
        API_URL,
        {
            headers: {
                Cookie: `authenticate=${ctx.cookies.get("authenticate").value}`
            }
        }
    );

    const data = await response.json();

    if ('email' in data) {
        ctx.locals.user = data
    } else {
        ctx.locals.user = null;
    }

    return await next();
});