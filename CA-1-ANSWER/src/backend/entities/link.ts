import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
import { Comment } from "./comment";
import { Vote } from "./vote";
import { User } from "./user";

@Entity()
export class Link {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public userId!: number;

    @Column({ unique: true })
    public title!: string;

    @Column()
    public url!: string;

    @Column({ nullable: true})
    public dateTime!: Date;

    // An user can have many links but a link only belongs to an user
    @ManyToOne(type => User, user => user.links)
    public user!: User;

    // A link can have many comments but a comment only belongs to a link
    @OneToMany(type => Comment, comment => comment.link)
    public comments!: Comment[];

    // A link can have many votes but a vote only belongs to a link
    @OneToMany(type => Vote, vote => vote.link)
    public votes!: Vote[];

}
