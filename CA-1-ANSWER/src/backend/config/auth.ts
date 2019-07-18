import * as express from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends express.Request {
    userId: number;
} 

export interface AuthTokenContent {
    id: number;
}

// Middleware function used for JWT token validation
export function authMiddleware(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {

    // Read token signature from environment variables
    const AUTH_SECRET = process.env.AUTH_SECRET;

    // Read token from request headers
    const token = req.headers["x-auth-token"];

    // Client error if no token found in request headers
    if (typeof token !== "string") {
        res.status(400).send();
    } else {

        // Server error is enironment variable is not set
        if (AUTH_SECRET === undefined) {
            throw new Error("Missing environment variable AUTH_SECRET");
        } else {
            try {

                // Check that the token is valid
                const obj = jwt.verify(token, AUTH_SECRET) as AuthTokenContent;

                // Add the user ID to the HTTP request object
                // so we can access it from the NEXT request handler
                (req as AuthenticatedRequest).userId = obj.id;

                // Invoke NEXT request handler
                next();
            } catch(err) {
                // Unauthorized if the token cannot be verified
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        }
    }
}
