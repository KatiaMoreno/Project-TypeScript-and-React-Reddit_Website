import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Link } from "./link";
import { User } from "./user";

@Entity()
export class Comment {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public userId!: number;

    @Column()
    public linkId!: number;

    @Column()
    public content!: string;

    @Column({ nullable: true})
    public dateTime!: Date;

    // A link can have many comments but a comment only belongs to one link
    @ManyToOne(type => Link, link => link.comments)
    public link!: Link;

    // An user can have many comments but a comment only belongs to an user
    @ManyToOne(type => User, user => user.comments)
    public user!: User;

}
