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
import { UserDetails as UserDetailsComponent } from "../components/user_details/user_details";
import { withRouter } from "react-router";
import { Comment, CommentDetails } from "../components/comment/comment";
import { Listview } from "../components/listview/listview";
import { getAuthToken } from "../components/with_auth/with_auth"
import { LinkDetails } from "../components/link_details/link_details";


interface UserData {
    id: number;
    email: string;
    password:string;
    pic: string;
    bio: string;
    links: LinkDetails[];
    voteCount: number | null;
    comments: CommentDetails[]
}

interface UserDetailsProps {
    id: string;
}

interface UserDetailsState {
    user: UserData | null;
    newCommentContent: string
}

export class UserDetailsInternal extends React.Component<UserDetailsProps, UserDetailsState> {
    public constructor(props: UserDetailsProps) {
        super(props);
        this.state = {
            user: null,
            newCommentContent: ""
        };
    }
    public componentWillMount() {
        (async () => {
            const data = await getUser(this.props.id);
            this.setState({ user: data });
        })();
    }
    public render() {
        if (this.state.user === null) {
            return <div>Loading...</div>;
        } else {
            return <div>
                <UserDetails {...this.state.user} />
                <Listview
                    items={
                        this.state.user.comments.map((comment, userIndex) => {
                            return (
                                <Comment key={userIndex} {...comment} />
                            );
                        })
                    }
                />
                {this._renderCommentEditor()}
            </div>;
        }
    }
    private _renderCommentEditor() {
        const token = getAuthToken();
        if (token) {
            return (
                <React.Fragment>
                    <div>
                        <textarea
                            className="input-text"
                            placeholder="Write your comment here"
                            value={this.state.newCommentContent}
                            onChange={(e) => this.setState({ newCommentContent: e.currentTarget.value })}
                        ></textarea>
                    </div>
                    <div>
                        <button
                            onClick={() => this._handleCreateComment()}
                            style={{ width: "100%" }}
                            className="btn"
                        >
                            Submit
                        </button>
                    </div>
                </React.Fragment>
            );
        } else {
            return <div>Please Sign In if you wish to write a comment...</div>;
        }
    }
    private _handleCreateComment() {
        (async () => {
            try {
                const token = getAuthToken();
                if (token && this.state.user) {
                    const newComment = await createComment(
                        this.state.user.id,
                        this.state.newCommentContent,
                        token
                    );
                }
            } catch (err) {

            }
        })();
    }
}

export const UserDetails = withRouter(props => <UserDetailsInternal id={props.match.params.id} />)

async function getUser(id: string) {
    const response = await fetch(`/api/v1/users/${id}`);
    const json = await response.json();
    return json as UserData;
}

async function createComment(userId: number, content: string, jwt: string) {
    const update = {
        userId: userId,
        content: content
    };
    const response = await fetch(
        "/api/v1/comments",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": jwt
            },
            body: JSON.stringify(update)
        }
    );
    const json = await response.json();
    return json;
}
