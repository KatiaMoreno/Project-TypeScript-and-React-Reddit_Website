import { getConnection, Repository } from "typeorm";
import { Link } from "../entities/link";

export function getLinkRepository(): Repository<Link> {
    const connection = getConnection();
    return connection.getRepository(Link);
}
