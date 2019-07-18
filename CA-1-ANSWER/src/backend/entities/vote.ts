import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Link } from "./link";
import { User } from "./user";

@Entity()
export class Vote {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public userId!: number;

    @Column()
    public linkId!: number;

    @Column()
    public isPositive!: boolean;

    @Column({ nullable: true})
    public dateTime!: Date;

    // A link can have many votes but a vote only belongs to a link
    @ManyToOne(type => Link, link => link.votes)
    public link!: Link;

    // An user can have many votes but a vote only belongs to an user
    @ManyToOne(type => User, user => user.votes)
    public user!: User;

}
