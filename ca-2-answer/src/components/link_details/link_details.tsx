/*
**********************************************************************
CCT College Dublin - Interactive Web Applications Class
Author: Katia Moreno
Student number: 2015255
Project Title: Implementing a Web UI with TypeScript and React 
Created: 12/May/2019
**********************************************************************
*/
import React from 'react';


export interface LinkPreviewDetails {
    id: number;
    userId: number;
    email: string;
    title: string;
    url: string;
    dateTime: string,
    commentCount: number | null;
    voteCount: number | null;
}

interface LinkDetailsProps extends LinkPreviewDetails {
    // ...
}

interface LinkDetailsState {
    //
}

export class LinkDetails extends React.Component<LinkDetailsProps, LinkDetailsState> {
    public render() {
        return (
            <table className="link-details" 
            style={{ 
                //backgroundColor: "red",                   
                //boxShadow: "0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12)",
                width:"50%",
                
                paddingTop: "5px",
                paddingBottom: "5px",
                paddingRight: "5px",
                paddingLeft:"5px",
                
                marginLeft:"1%",
                marginRight:"1%",
                marginBottom:"1%",
                                    
                textDecoration:"none",// remove underline
                textAlign:"left",
                fontWeight: "normal",                                   
                color:"blue",
                borderRadius:"5px"
                }}>
                <tbody>
                    <tr>
                        <td className="left"  
                        style={{
                            boxShadow: "0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12)",
                            color:"black",
                            background:"#D3D3D3",
                            marginRight:"1px",
                            marginLeft:"1px",
                            fontWeight: "bold",
                            borderRadius:"2px",
                            paddingRight: "30px",
                            paddingLeft:"30px",
                            textDecoration: 'none',
                            textAlign:"initial"
                            
                            }}>
                            <div className="vote-btn">↑</div>
                            <div>{this.props.voteCount ? this.props.voteCount : 0}</div>
                            <div className="vote-btn">↓</div>
                        </td>

                        <td className="right" style={{ textDecoration: 'none' }}>
                            <div className="audit" style={{color:"#D3D3D3", fontWeight: "normal"}}>{this.renderTimeSinceDate(this.props.dateTime)} ago by {this.props.email}</div>
                            <h2 className="title"  style={{color:"black"}}>{this.props.title}</h2>
                            <div className="url" >{this.props.url}</div>
                            
                            <div className="comment-count" style={{color:"#D3D3D3", fontWeight: "bold", paddingTop:"20px" }}>
                            <img src="https://img.icons8.com/small/24/000000/topic.png"></img>
                            
                            {this.props.commentCount} Comments</div>
                        </td>

                    </tr>
                </tbody>
            </table>
        );
    }

    private renderTimeSinceDate(jsonDate: string) {
        const time = Date.parse(jsonDate);
        const now = new Date().getTime();
        const difference = (now - time) / 1000;
        const seconds = Math.ceil(difference);
        const minutes = Math.ceil(seconds / 60);
        const hours = Math.ceil(minutes / 60);
        const days = Math.ceil(hours / 24);
        if (seconds < 60) {
            return `${seconds} seconds`;
        } else if (minutes < 60) {
            return `${minutes} minutes`;
        } else if (hours < 24) {
            return `${hours} hours`;
        } else {
            return `${days} days`;
        }
    }
}
