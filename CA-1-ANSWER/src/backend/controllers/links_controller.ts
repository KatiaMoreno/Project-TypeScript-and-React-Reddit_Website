import * as express from "express";
import { Repository } from "typeorm";
import { getLinkRepository } from "../repositories/link_repository";
import { Link } from "../entities/link";
import { authMiddleware, AuthenticatedRequest } from "../config/auth";
import * as joi from "joi";
import { getVoteRepository } from "../repositories/vote_repository";
import { Vote } from "../entities/vote";

export const linkIdSchema = {
    id: joi.number()
};

export const linkSchema = {
    title: joi.string(),
    url: joi.string()
};

interface LinkPreviewDetails {
    id: number;
    userId: number;
    email: string;
    title: string;
    url: string;
    dateTime: string;
    commentCount: number | null;
    voteCount: number | null;
}

// We pass the repository instance as an argument
// We use this pattern so we can unit test the handlers with ease
export function getHandlers(linkRepository: Repository<Link>, voteRepository: Repository<Vote>) {

    const getAllLinks = (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                const queryResult: LinkPreviewDetails[] = await linkRepository.query(`
                    SELECT
                        "link"."id",
                        "link"."userId",
                        "user"."email",
                        "link"."title",
                        "link"."url",
                        "link"."dateTime",
                        count("comment"."id") "commentCount",
                        (CASE WHEN "votes"."voteCount" IS NULL THEN 0 ELSE "votes"."voteCount" END)
                    FROM "link" "link"
                    LEFT JOIN "user" "user" ON "user"."id" = "link"."userId"
                    LEFT JOIN "comment" "comment" ON "comment"."linkId" = "link"."id"
                    LEFT JOIN (
                        SELECT
                            (CASE WHEN "negativeVotes"."linkId" IS NULL THEN "positiveVotes"."linkId" ELSE "negativeVotes"."linkId" END),
                            ((CASE WHEN "positiveVotes"."positiveVotesCount" IS NULL THEN 0 ELSE "positiveVotes"."positiveVotesCount" END) -
                            (CASE WHEN "negativeVotes"."negativeVotesCount" IS NULL THEN 0 ELSE "negativeVotes"."negativeVotesCount" END)) "voteCount"
                        FROM (
                            SELECT "linkId", count(*) "positiveVotesCount"
                            FROM "vote" 
                            WHERE "isPositive" = true
                            GROUP BY "linkId"
                        ) "positiveVotes"
                        FULL JOIN (
                            SELECT "linkId", count(*) "negativeVotesCount"
                            FROM "vote" 
                            WHERE "isPositive" = false 
                            GROUP BY "linkId"
                        ) "negativeVotes" ON "negativeVotes"."linkId" = "positiveVotes"."linkId"
                    ) "votes" ON "votes"."linkId" = "link"."id"
                    GROUP BY "link"."id", "votes"."voteCount", "user"."email"            
                `);

                res.json(queryResult);

            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    const getLinkById = (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // Validate Id in URL
                const idStr = req.params.id;
                const linkId = { id: parseInt(idStr) };
                const idValidationresult = joi.validate(linkId, linkIdSchema);
                
                if (idValidationresult.error) {
                    res.status(400).json({ error: "Bad request" }).send();
                } {

                    const queryResult = await linkRepository.query(`
                        SELECT
                            "link"."id",
                            "link"."userId",
                            "user"."email",
                            "link"."title",
                            "link"."url",
                            "link"."dateTime",
                            count("comment"."id") "commentCount",
                            (CASE WHEN "votes"."voteCount" IS NULL THEN 0 ELSE "votes"."voteCount" END)
                        FROM "link" "link"
                        LEFT JOIN "user" "user" ON "user"."id" = "link"."userId"
                        LEFT JOIN "comment" "comment" ON "comment"."linkId" = "link"."id"
                        LEFT JOIN (
                            SELECT 
                                (CASE WHEN "negativeVotes"."linkId" IS NULL THEN $1 ELSE "negativeVotes"."linkId" END),
                                ((CASE WHEN "positiveVotes"."positiveVotesCount" IS NULL THEN 0 ELSE "positiveVotes"."positiveVotesCount" END) -
                                (CASE WHEN "negativeVotes"."negativeVotesCount" IS NULL THEN 0 ELSE "negativeVotes"."negativeVotesCount" END)) "voteCount"
                            FROM (
                                SELECT "linkId", count(*) "positiveVotesCount"
                                FROM "vote" 
                                WHERE "isPositive" = true AND "linkId" = $1
                                GROUP BY "linkId"
                            ) "positiveVotes"
                            FULL JOIN (
                                SELECT "linkId", count(*) "negativeVotesCount"
                                FROM "vote" 
                                WHERE "isPositive" = false AND "linkId" = $1
                                GROUP BY "linkId"
                            ) "negativeVotes" ON "negativeVotes"."linkId" = "positiveVotes"."linkId"
                        ) "votes" ON "votes"."linkId" = "link"."id"
                        WHERE "link"."id" = $1
                        GROUP BY "link"."id", "votes"."voteCount", "user"."email"
                    `, [ linkId.id ]);

                    const linkPreviewDetails: LinkPreviewDetails = queryResult[0];

                    if (linkPreviewDetails === undefined) {
                        res.status(404)
                           .json({ error: "Not found"})
                           .send();
                    } else {

                        const comments = await linkRepository.query(`
                            SELECT
                                "comment"."id",
                                "comment"."userId", 
                                "user"."email",
                                "comment"."linkId",
                                "comment"."content",
                                "comment"."dateTime"
                            FROM "comment" "comment"
                            LEFT JOIN "user" "user" ON "user"."id" = "comment"."userId"
                            WHERE "linkId" = $1
                        `, [ linkId.id ]);

                        const link = {
                            id: linkPreviewDetails.id,
                            userId: linkPreviewDetails.userId,
                            email: linkPreviewDetails.email,
                            title: linkPreviewDetails.title,
                            url: linkPreviewDetails.url,
                            dateTime: linkPreviewDetails.dateTime,
                            commentCount: linkPreviewDetails.commentCount,
                            voteCount: linkPreviewDetails.voteCount,
                            comments: comments
                        };

                        res.json(link);
                    }
                }
            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    const createLink = (req: express.Request, res: express.Response) => {
        (async () => {
            try {
                
                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Read and validate the link from the request body
                const newLink = req.body;
                const result = joi.validate(newLink, linkSchema);

                if (result.error) {
                    res.json({ msg: `Invalid user details in body!`}).status(400).send();
                } else {

                    // Create new link
                    const linkToBeSaved = new Link();
                    linkToBeSaved.userId = (req as AuthenticatedRequest).userId;
                    linkToBeSaved.url = newLink.url;
                    linkToBeSaved.title = newLink.title;
                    linkToBeSaved.dateTime = new Date();
                    const savedLink = await linkRepository.save(linkToBeSaved);
                    res.json(savedLink).send();
                }

            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    const deleteLinkById = (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Validate Id in URL
                const idStr = req.params.id;
                const linkId = { id: parseInt(idStr) };
                const idValidationresult = joi.validate(linkId, linkIdSchema);
                
                if (idValidationresult.error) {
                    res.status(400).json({ error: "Bad request" }).send();
                } else {

                    // Try to find link to be deleted
                    const link = await linkRepository.findOne(linkId.id);

                    // If link not found return 404 not found
                    if (link === undefined) {
                        res.status(404)
                           .json({ error: "Not found"})
                           .send();
                    } else {

                        // If lik was found, remove it from DB
                        const userId = (req as AuthenticatedRequest).userId;
                        const ownerId = link.userId;

                        if (userId !== ownerId) {
                            res.status(403)
                               .json({ msg: `The current user is not the author of the comment` })
                               .send();
                        } else {
                            await linkRepository.remove(link);
                            res.json({ msg: "OK" }).send();
                        }
                        
                    }
                }
            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    async function getVoteCount(linkId: number) {
        const queryResult = await  voteRepository.query(`
            SELECT
                "negativeVotes"."linkId",
                ((CASE WHEN "positiveVotes"."positiveVotesCount" IS NULL THEN 0 ELSE "positiveVotes"."positiveVotesCount" END) -
                (CASE WHEN "negativeVotes"."negativeVotesCount" IS NULL THEN 0 ELSE "negativeVotes"."negativeVotesCount" END)) "voteCount"
            FROM (
                SELECT "linkId", count(*) "positiveVotesCount"
                FROM "vote" 
                WHERE "isPositive" = true AND "linkId" = $1
                GROUP BY "linkId"
            ) "positiveVotes"
            FULL JOIN (
                SELECT "linkId", count(*) "negativeVotesCount"
                FROM "vote" 
                WHERE "isPositive" = false AND "linkId" = $1
                GROUP BY "linkId"
            ) "negativeVotes" ON "negativeVotes"."linkId" = "positiveVotes"."linkId"
        `, [ linkId ]);

        return {
            linkId: linkId,
            voteCount: queryResult[0] ? (queryResult[0].voteCount as number) : 0
        };
        
    }

    const upvoteLink = (req: express.Request, res: express.Response) => {
        (async () => {

            try {

                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Validate Id in URL
                const idStr = req.params.id;
                const linkId = { id: parseInt(idStr) };
                const idValidationresult = joi.validate(linkId, linkIdSchema);
                
                if (idValidationresult.error) {
                    res.status(400).json({ error: "Bad request" }).send();
                } else {

                    // Try to find previous vote by same user
                    const vote = await voteRepository.findOne({
                        where: {
                            linkId: linkId.id,
                            userId: (req as AuthenticatedRequest).userId
                        }
                    });

                    // The user has already voted
                    if (vote !== undefined && vote.isPositive === false) {

                        // If the vote was negative we remove it
                        await voteRepository.delete({ id: vote.id });
                        const voteCount = await getVoteCount(linkId.id);
                        res.status(200).json(voteCount);
    
                    } else if (vote !== undefined && vote.isPositive === true) {

                        // if the vote was positive we cannot vote again
                        const voteCount = await getVoteCount(linkId.id);
                        res.status(200).json(voteCount);

                    } else {

                        // If there was no vote we create it
                        const voteToBeSaved = new Vote();
                        voteToBeSaved.isPositive = true;
                        voteToBeSaved.linkId = linkId.id;
                        voteToBeSaved.userId = (req as AuthenticatedRequest).userId;
                        voteToBeSaved.dateTime = new Date();
                        await voteRepository.save(voteToBeSaved);
                        const voteCount = await getVoteCount(linkId.id);
                        res.status(200).json(voteCount);
                    }
                }
                
            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }

        })();
    }

    const downvoteLink = (req: express.Request, res: express.Response) => {
        (async () => {

            try {

                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Validate Id in URL
                const idStr = req.params.id;
                const linkId = { id: parseInt(idStr) };
                const idValidationresult = joi.validate(linkId, linkIdSchema);
                
                if (idValidationresult.error) {
                    res.status(400).json({ error: "Bad request" }).send();
                } else {

                    // Try to find previous vote by same user
                    const vote = await voteRepository.findOne({
                        where: {
                            linkId: linkId.id,
                            userId: (req as AuthenticatedRequest).userId
                        }
                    });

                    // The user has already voted
                    if (vote !== undefined && vote.isPositive === true) {

                        // If the vote was positive we remove it
                        await voteRepository.delete({ id: vote.id });
                        const voteCount = await getVoteCount(linkId.id);
                        res.status(200).json(voteCount);

                    } else if (vote !== undefined && vote.isPositive === false) {

                        // if the vote was negative we cannot vote again
                        const voteCount = await getVoteCount(linkId.id);
                        res.status(200).json(voteCount);

                    } else {

                        // If there was no vote we create it
                        const voteToBeSaved = new Vote();
                        voteToBeSaved.isPositive = false;
                        voteToBeSaved.linkId = linkId.id;
                        voteToBeSaved.userId = (req as AuthenticatedRequest).userId;
                        voteToBeSaved.dateTime = new Date();
                        await voteRepository.save(voteToBeSaved);
                        const voteCount = await getVoteCount(linkId.id);
                        res.status(200).json(voteCount);
                    }

                }

                
            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }

        })();
    }

    return {
        getAllLinks,
        getLinkById,
        createLink,
        deleteLinkById,
        upvoteLink,
        downvoteLink
    };

}

export function getLinksController() {

    const linkRepository = getLinkRepository();
    const voteRepository = getVoteRepository();
    const handlers = getHandlers(linkRepository, voteRepository);
    const router = express.Router();

    // Public
    router.get("/", handlers.getAllLinks);
    router.get("/:id", handlers.getLinkById);

    // Private
    router.post("/", authMiddleware, handlers.createLink);
    router.delete("/:id", authMiddleware, handlers.deleteLinkById);
    router.post("/:id/upvote", authMiddleware, handlers.upvoteLink);
    router.post("/:id/downvote", authMiddleware, handlers.downvoteLink);

    return router;
}
