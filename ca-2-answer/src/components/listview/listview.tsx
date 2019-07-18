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

interface ListviewProps {
    items: JSX.Element[];
}

interface ListviewState {
    //
}

export class Listview extends React.Component<ListviewProps, ListviewState> {
    public render() {

        
        if (this.props.items.length < 1) {
            return <div>There is no items!</div>;
        } else {
            return <ul className="list-view"  style={{listStyleType:"none"}}>
                {this.props.items.map(function (item, itemIndex) {
                    return <li key={itemIndex}>{item}</li>;
                })}
            </ul>;
        }
    }
}
