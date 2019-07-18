import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Vote } from "./vote";
import { Link } from "./link";
import { Comment } from "./comment";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({ unique: true })
    public email!: string;

    @Column()
    public password!: string;

    @Column({ nullable: true })
    public pic!: string;

    @Column({ nullable: true })
    public bio!: string;

    // An user can have many votes but a link only belongs to an user
    @OneToMany(type => Link, link => link.user)
    public links!: Link[];

    // An user can have many votes but a vote only belongs to an user
    @OneToMany(type => Vote, vote => vote.user)
    public votes!: Vote[];

    // An user can have many votes but a vote only belongs to an user
    @OneToMany(type => Comment, comment => comment.user)
    public comments!: Comment[];

}
