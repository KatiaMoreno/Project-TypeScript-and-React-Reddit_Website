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
import { LinkDetails as LinkDetailsComponent } from "../components/link_details/link_details";
import { withRouter } from "react-router";
import { Comment, CommentDetails } from "../components/comment/comment";
import { Listview } from "../components/listview/listview";
import { getAuthToken } from "../components/with_auth/with_auth"

interface LinkData {
    id: number;
    userId: number;
    email: string;
    title: string;
    url: string;
    dateTime: string;
    commentCount: number | null;
    voteCount: number | null;
    comments: CommentDetails[]
}

interface LinkDetailsProps {
    id: string;
}

interface LinkDetailsState {
    link: LinkData | null;
    newCommentContent: string
}

export class LinkDetailsInternal extends React.Component<LinkDetailsProps, LinkDetailsState> {
    public constructor(props: LinkDetailsProps) {
        super(props);
        this.state = {
            link: null,
            newCommentContent: ""
        };
    }
    public componentWillMount() {
        (async () => {
            const data = await getData(this.props.id);
            this.setState({ link: data });
        })();
    }
    public render() {
        if (this.state.link === null) {
            return <div>Loading...</div>;
        } else {
            return <div>
                <LinkDetailsComponent {...this.state.link} />
                <Listview
                    items={
                        this.state.link.comments.map((comment, commentIndex) => {
                            return (
                                <Comment key={commentIndex} {...comment} />
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
                            style={{
                                boxSizing: "border-box",
                                width: "300px",
                                height: "150px",
                                padding: "30px",
                                border: "5px solid blue",
                                marginLeft:"35%"   
                            }}
                            placeholder="Write your comment here"
                            value={this.state.newCommentContent}
                            onChange={(e) => this.setState({ newCommentContent: e.currentTarget.value })}
                        ></textarea>
                    </div>
                    <div>
                        <button
                            onClick={() => this._handleCreateComment()}
                            style={{
                                marginTop: "0.5px",
                                color:"blue",
                                fontWeight: "bold",
                                marginLeft:"35%" 
                            }}
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
                if (token && this.state.link) {
                    const newComment = await createComment(
                        this.state.link.id,
                        this.state.newCommentContent,
                        token
                    );
                }
            } catch (err) {

            }
        })();
    }
}

export const LinkDetails = withRouter(props => <LinkDetailsInternal id={props.match.params.id} />)

async function getData(id: string) {
    const response = await fetch(`/api/v1/links/${id}`);
    const json = await response.json();
    return json as LinkData;
}

async function createComment(linkId: number, content: string, jwt: string) {
    const update = {
        linkId: linkId,
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
