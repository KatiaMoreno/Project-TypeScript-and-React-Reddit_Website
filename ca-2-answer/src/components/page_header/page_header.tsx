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
import { Link } from "react-router-dom";
import { withAuth } from "../with_auth/with_auth";

interface PageHeaderInternalProps {
    token: string | null;
}

interface PageHeaderInternalState {}

class PageHeaderInternal extends React.Component<PageHeaderInternalProps, PageHeaderInternalState> {
    public render() {
  

        return (
            <div className="top-navbar"   
            style={{ 
                //position:"fixed",
                boxShadow: "0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12)",
                float:"none",
                position:"static",
                display:"block",
                padding:"10px",
                margin:"auto",
                width:"100%",
                height:"10%"
                        }}>
               
                <div className="container" >
                <img style={{
                    
                     width: "100px", 
                     height: "30px" }} 
                    src="https://logos-download.com/wp-content/uploads/2016/06/Reddit_logo_full_1.png" 
                    />

                    <Link className="left" to="/" 
                     style={{ 
                        //backgroundColor: "red",                   
                        boxShadow: "0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12)",
                        width:"10%",
                        position:"static",
                        paddingTop: "5px",
                        paddingBottom: "5px",
                        paddingRight: "10px",
                        paddingLeft:"10px",
                        
                        margin:"auto",
                                            
                        textDecoration:"none",// remove underline
                        textAlign:"right",
                        fontWeight: "bold",                                   
                        color:"blue",
                        borderRadius:"5px"
                        }}> Home </Link>
                    {this._renderLoginOrProfile()}
                </div>
            </div>
        );
    }
    private _renderLoginOrProfile() {
        if (this.props.token) {
            return <Link className="btn right" to="/profile"
            style={{ 
                           
                boxShadow: "0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12)",
                width:"10%",
                position:"static",
                paddingTop: "5px",
                paddingBottom: "5px",
                paddingRight: "10px",
                paddingLeft:"10px",
                
                marginTop: "20px",
                marginBottom: "20px",
                marginRight:"2%",
                marginLeft:"10px",
                
                textDecoration:"none",// remove underline
                textAlign:"center",
                fontWeight: "bold",                                   
                color:"white",
                backgroundColor: "red",   
                borderRadius:"5px"
            }}

            >User Profile</Link>
        } else {
            return <React.Fragment>
                <Link className="btn right" to="/sign_in"
                style={{ 
                   //backgroundColor: "red",                   
                   boxShadow: "0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12)",
                   //width:"10%",
                   position:"static",
                   paddingTop: "5px",
                   paddingBottom: "5px",
                   paddingRight: "20px",
                   paddingLeft:"20px",
                   
                   marginTop: "20px",
                   marginBottom: "20px",
                   marginLeft:"68%",
                   
                   textDecoration:"none",// remove underline
                   textAlign:"center",
                   fontWeight: "bold",                                   
                   color:"blue",
                   borderRadius:"5px"
                }}>LOG IN</Link>
                
                <Link className="btn right" to="/sign_up"
                 style={{ 
                                    
                    boxShadow: "0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12)",
                    width:"10%",
                    position:"static",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    paddingRight: "20px",
                    paddingLeft:"20px",
                    
                    marginTop: "20px",
                    marginBottom: "10px",
                    marginLeft:"1%",
                    
                    textDecoration:"none",// remove underline
                    textAlign:"center",
                    fontWeight: "bold",                                   
                    color:"white",
                    backgroundColor: "blue",   
                    borderRadius:"5px"
                }}>SIGN UP</Link>

                           

            </React.Fragment>
        }
    }
}

export const PageHeader = withAuth(props => <PageHeaderInternal token={props.authToken} />)

