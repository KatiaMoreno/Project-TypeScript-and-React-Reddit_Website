import { getConnection, Repository } from "typeorm";
import { Vote } from "../entities/vote";

export function getVoteRepository(): Repository<Vote> {
    const connection = getConnection();
    return connection.getRepository(Vote);
}
