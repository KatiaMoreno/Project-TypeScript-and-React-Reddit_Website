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

interface HeaderProps {
    label: string;
    color?: string;
}

/*
interface HeaderState {
    //
}
*/

export function Header(props: HeaderProps) {
    const style: React.CSSProperties = {
        fontFamily: `Rubik,Lato,"Lucida Grande","Lucida Sans Unicode",Tahoma,Sans-Serif`,
        fontSize: "25px",
        fontWeight: 700,
        color: props.color !== undefined ? props.color : "#000000",
        borderBottom: "3px solid",
        textAlign:"right",
        
        
        
    };
    return <div>
        <h1 style={style}>{props.label}</h1>
        <img style={{ width: "100px", height: "30px" }} src="https://logos-download.com/wp-content/uploads/2016/06/Reddit_logo_full_1.png" />
    </div>;
}

/*
export class Header extends React.Component<HeaderProps, HeaderState> {
    public render() {
        const style: React.CSSProperties = {
            fontFamily: `Rubik,Lato,"Lucida Grande","Lucida Sans Unicode",Tahoma,Sans-Serif`,
            fontSize: "56px",
            fontWeight: 700,
            color: this.props.color !== undefined ? this.props.color : "#000000",
            borderBottom: "3px solid"
        };
        return <div>
            <h1 style={style}>{this.props.label}</h1>
        </div>;
    }
}
*/
