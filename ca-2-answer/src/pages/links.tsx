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
import { Listview } from "../components/listview/listview";
import { Link } from "react-router-dom";
import { LinkDetails, LinkPreviewDetails } from "../components/link_details/link_details";

interface LinksProps {
    //
}

interface LinksState {
    links: LinkPreviewDetails[] | null;
    query: string;
}

export class Links extends React.Component<LinksProps, LinksState> {
    public constructor(props: LinksProps) {
        super(props);
        this.state = {
            links: null,
            query: ""
        };
    }
    public componentWillMount() {
        (async () => {
            const data = await getData();
            this.setState({ links: data });
        })();
    }
    public render() {
        if (this.state.links === null) {
            return <div>Loading...</div>;
        } else {
            const filteredLinks = this.state.links.filter((link) => {
                return link.title.indexOf(this.state.query) !== -1;
            });
            return <div>
                
                <input  style={{ 
                        //backgroundColor: "red",                   
                        boxShadow: "0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12)",
                        width:"50%",
                        
                        paddingTop: "10px",
                        paddingBottom: "5px",
                        paddingRight: "10px",
                        paddingLeft:"10px",
                        
                        marginLeft:"25%",
                                            
                        textDecoration:"none",// remove underline
                        textAlign:"left",
                        fontWeight: "normal",                                   
                        color:"blue",
                        borderRadius:"5px"
                        }}

                    className="input-text"
                    placeholder="Search Reddit"
                    type="text"
                    onKeyUp={(e) => this._onSearch(e.currentTarget.value)}
                /><img src="https://img.icons8.com/metro/26/000000/search.png"></img>
                
                <Listview
                    items={
                        filteredLinks.map((link, linkIndex) => {
                            return (
                                <Link to={`/link_details/${link.id}`}>
                                    <div style={{ 
                                        //backgroundColor: "red",                   
                                        boxShadow: "0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12)",
                                        width:"45%",
                                        
                                        paddingTop: "15px",
                                        paddingBottom: "25px",
                                        paddingRight: "10px",
                                        paddingLeft:"10px",
                                        
                                        marginLeft:"25%",
                                        marginBottom:"1%",
                                                            
                                        textDecoration:"none",// remove underline
                                        textAlign:"left",
                                        fontWeight: "normal",                                   
                                        color:"blue",
                                        borderRadius:"5px"
                                        }}>
                                                                            
                                             <LinkDetails key={linkIndex} {...link} />
                                            
                                    </div>
                                   
                                </Link>
                            );
                        })
                    }
                />
            </div>;
        }
    }
    private _onSearch(query: string) {
        this.setState({ query: query });
    }
}

async function getData() {
    const response = await fetch("/api/v1/links/");
    const json = await response.json();
    return json as LinkPreviewDetails[];
}