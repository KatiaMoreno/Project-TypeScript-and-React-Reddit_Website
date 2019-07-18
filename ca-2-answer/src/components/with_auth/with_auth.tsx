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
import { fromEvent } from "rxjs";

const key = "__token";
const win = (window as any);

export const getAuthToken = () => {
    const token: string | null = win[key] ? win[key] : null;
    return token;
}

const authTokenObservable = fromEvent<CustomEvent<string | null>>(document, "authTokenChange");

const onAuthTokenChange = (cb: (authToken: string | null) => void) => {
    authTokenObservable.subscribe({
        next: val => {
            cb(val.detail);
        }
    });
};

interface WithAuthProps {
    cb: (props: AuthProps) => JSX.Element
}

interface WithAuthState {
    authToken: string | null;
}

class WithAuth extends React.Component<WithAuthProps, WithAuthState> {
    public constructor(props: WithAuthProps) {
        super(props);
        this.state = {
            authToken: getAuthToken()
        };
        onAuthTokenChange(value => this.setState({ authToken: value }));
    }
    public render() {
        return (
            <React.Fragment>
                {this.props.cb({ authToken: this.state.authToken })}
            </React.Fragment>
        );
    }
}

export interface AuthProps {
    authToken: string | null;
}

export function withAuth(cb: (props: AuthProps) => JSX.Element) {
    return () => <WithAuth cb={cb} />;
}

export const setAuthToken = (token: string | null) => {
    win[key] = token;
    const authTokenChangeEvent = new CustomEvent("authTokenChange", { detail: token });
    document.dispatchEvent(authTokenChangeEvent);
};
