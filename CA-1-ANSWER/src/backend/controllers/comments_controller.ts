import * as express from "express";
import { Repository } from "typeorm";
import { Comment } from "../entities/comment";
import { getCommentRepository } from "../repositories/comment_repository";
import { authMiddleware, AuthenticatedRequest } from "../config/auth";
import * as joi from "joi";

export const commentIdSchema = {
    id: joi.number()
};

export const commentUpdateSchema = {
    content: joi.string()
}

export const newCommentSchema = {
    linkId: joi.number(),
    content: joi.string()
};

// We pass the repository instance as an argument
// We use this pattern so we can unit test the handlers with ease
export function getHandlers(commentRepository: Repository<Comment>) {

    // Update an existing comment
    const updateComment = (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }
                
                const commentId = { id: parseInt(req.params.id) };
                const newComment = req.body;

                // Validate the Id in the URL
                const idValidationResult = joi.validate(commentId, commentIdSchema);

                // Validate the comment update in the request body
                const commmentUpdateValidationResult = joi.validate(newComment, commentUpdateSchema);

                if (idValidationResult.error) {
                    // The comment id is invalid
                    res.status(400)
                       .json({ msg: `Invalid parameter id '${commentId.id}' in URL` })
                       .send();
                } else if (commmentUpdateValidationResult.error) {
                    // The update is invalid
                    res.status(400)
                       .json({ msg: `Invalid comment update in request body` })
                       .send();
                } else {

                    // Try to read the comment
                    const comment = await commentRepository.findOne(commentId);

                    // The comment is not found
                    if (comment === undefined) {
                        res.status(404)
                           .json({ msg: `Comment with id '${commentId.id}' not found!` })
                           .send();
                    } else {

                        // Validate that the current user is also
                        // the author of the comment to be updated
                        const commentOwnerId = comment.userId;
                        const userId = (req as AuthenticatedRequest).userId;

                        // User is not the author
                        if (commentOwnerId !== userId) {
                            res.status(403)
                               .json({ msg: `The current user is not the author of the comment` })
                               .send();
                        } else {

                            // Update comment content
                            const where = { id: commentId.id };
                            const set = { content: newComment.content };
                            commentRepository.update(where, set);
                            
                            res.json({ ok: "ok" }).send();
                        }

                    }
                }
            } catch(err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    // Create a new comment
    const createComment = (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Validate the comment in the request body
                const newComment = req.body;
                const result = joi.validate(newComment, newCommentSchema);

                if (result.error) {
                    res.json({ msg: `Invalid comment details in body!`}).status(400).send();
                } else {

                    // Create new comment
                    const commentToBeSaved = new Comment();
                    commentToBeSaved.userId = (req as AuthenticatedRequest).userId;
                    commentToBeSaved.linkId = newComment.linkId;
                    commentToBeSaved.content = newComment.content;
                    commentToBeSaved.dateTime = new Date();
                    const savedComment = await commentRepository.save(commentToBeSaved);
                    res.json(savedComment).send();
                }

            } catch(err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    // Delete a comment by its Id
    const deleteCommentById = (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Validate the comment ID in the request URL
                const commentId = { id: req.params.id };
                const result = joi.validate(commentId, commentIdSchema);

                // The id is invalid
                if (result.error) {
                    res.status(400)
                    .json({ msg: `Invalid parameter id '${commentId.id}' in URL` })
                    .send();
                } else {

                    // Try to read the comment
                    const commentToBeDeleted = await commentRepository.findOne(commentId.id);

                    // The comment is not found
                    if (commentToBeDeleted === undefined) {
                        res.status(404)
                           .json({ msg: `Comment with id '${commentId.id}' not found!` })
                           .send();
                    } else {

                        // Validate that the current user is also
                        // the author of the comment to be updated
                        const commentOwnerId = commentToBeDeleted.userId;
                        const userId = (req as AuthenticatedRequest).userId;

                        if (commentOwnerId !== userId) {
                            res.status(403)
                                .json({ msg: `The current user is not the author of the comment` })
                                .send();
                        } else {

                            // Delete comment
                            await commentRepository.delete(commentId);
                            res.json({ ok: "ok" }).send();
                        }

                    }
                }

            } catch(err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                    .json({ error: "Internal server error"})
                    .send();
            }
        })();
    }

    return {
        updateComment,
        createComment,
        deleteCommentById
    };

}

export function getCommentsController() {

    const repository = getCommentRepository();
    const handlers = getHandlers(repository);
    const router = express.Router()

    // Private
    router.patch("/:id", authMiddleware, handlers.updateComment);
    router.post("/", authMiddleware, handlers.createComment);
    router.delete("/:id", authMiddleware, handlers.deleteCommentById);

    return router;
}
