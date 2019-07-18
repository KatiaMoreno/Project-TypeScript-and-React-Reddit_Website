/*
**********************************************************************
CCT College Dublin - Interactive Web Applications Class
Author: Katia Moreno
Student number: 2015255
Project Title: Implementing a Web UI with TypeScript and React 
Created: 12/May/2019
**********************************************************************
*/
import * as React from "react";
import { getAuthToken } from "../components/with_auth/with_auth";
import { Listview } from "../components/listview/listview";
import { withRouter } from "react-router";

interface Comment {
    id: number;
    userId: number;
    linkId: number;
    content: string;
}

interface Link {
    id: number;
    title: string;
    url: string;
    userId: number;
}

interface User {
    email: string;
    pic: string;
    bio: string;
    links: Link[];
    comments: Comment[];
}

interface ProfileProps {
    id: string | undefined;
}

interface ProfileState {
    user: null | User;
}

export class ProfileInternal extends React.Component<ProfileProps, ProfileState> {
    public constructor(props: ProfileProps) {
        super(props);
        this.state = {
            user: null
        };
    }
    public componentWillMount() {
        (async () => {
            if (this.props.id) {
                const user = await getUser(this.props.id);
                this.setState({ user: user });
            } else {
                const token = getAuthToken();
                if (token) {
                    const user = await getProfile(token);
                    this.setState({ user: user });
                }
            }
        })();
    }
    public render() {
        if (this.state.user === null) {
            return <div>Loading...</div>;
        } else {
            return <div>
                <img src={this.state.user.pic} />
                <div>{this.state.user.email}</div>
                <div>{this.state.user.bio}</div>
                <Listview
                    items={
                        this.state.user.links.map(link => <div>
                            <h3>{link.title}</h3>
                            <a href={link.url}>{link.url}</a>
                        </div>)
                    }
                />
                <Listview
                    items={
                        this.state.user.comments.map(comment => <div>
                            <p>{comment.content}</p>
                        </div>)
                    }
                />

                
            </div>
        }
    }
    
}

export const Profile = withRouter(props => <ProfileInternal id={props.match.params.id} />);

async function getProfile(token: string) {
    const reponse = await fetch(
        "/api/v1/auth/profile",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token
            }
        }
    );
    const json = await reponse.json();
    return json;
}

async function getUser(id: string) {
    const reponse = await fetch(
        `/api/v1/users/${id}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
    const json = await reponse.json();
    return json;
}
