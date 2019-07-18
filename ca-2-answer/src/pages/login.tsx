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
import * as joi from "joi";
import { withRouter } from "react-router-dom";
import * as H from 'history';
import { setAuthToken } from "../components/with_auth/with_auth";

const credentialSchema = {
    email: joi.string().email().required(),
    password: joi.string().min(3).max(30).required()
};

interface SignInOrSignUpProps {
    history: H.History;
    isSignIn: boolean;
}

interface SignInOrSignUpState {
    email: string;
    password: string;
    error: string | null;
}

export class SignInOrSignUpInternal extends React.Component<SignInOrSignUpProps, SignInOrSignUpState> {
    public constructor(props: SignInOrSignUpProps) {
        super(props);
        this.state = {
            email: "",
            password: "",
            error: null
        };
    }
    public render() {
        const style: React.CSSProperties = {
            width: "25%",
            boxShadow: "0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12)",
            paddingTop: "10px",
            paddingBottom: "10px",
            marginTop: "20px",
            marginBottom: "20px",
            marginLeft:"35%"                     
        };
        
             return (
                 <div style={style}>
            <div className="login-container">
                <h1>{this.props.isSignIn ? "Sign In": "Sign Up"}</h1>
                
                <div>
                    {this._renderServerErrors()}
                    {this._renderValidationErrors()}
                </div>

                <div   style={{ 
                        float:"none",
                        position:"static",
                        display:"block",
                        margin:"auto",
                        width:"75%"
                            }}>
                    <div>
                        <input
                            //className="input-text"
                            type="text"
                            placeholder="Email"
                            onKeyUp={(e) => this._updateEmail((e as any).target.value)}
                        />
                    </div>
                    <div>
                        <input
                            className="input-text"
                            style={{ marginTop: "0.5px"}}
                            type="password"
                            placeholder="Password"
                            onKeyUp={(e) => this._updatePassword((e as any).target.value)}
                        />
                    </div>
                    <div>
                        <button
                            onClick={() => this._handleSubmit()}
                            className="btn"
                            style={{
                            marginTop: "0.5px",
                            color:"blue",
                            fontWeight: "bold"

                          }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
            </div>
        );
    }
    private _renderServerErrors() {
        if (this.state.error === null) {
            return <div></div>;
        } else {
            return <div className="error-msg">{this.state.error}</div>;
        }
    }
    // Display errors or OK on screen
    private _renderValidationErrors() {
        const validationResult = joi.validate({
            email: this.state.email,
            password: this.state.password
        }, credentialSchema);
        if (validationResult.error) {
            return <div className="error-msg">
                {validationResult.error.details.map((d, i) => <div key={i}>{d.message}</div>)}
            </div>;
        } else {
            return <div className="success-msg">OK</div>;
        }
    }
    // Update the state (email) on keyup
    private _updateEmail(email: string) {
        this.setState({ email: email });
    }
    // Update the state (password) on keyup
    private _updatePassword(password: string) {
        this.setState({ password: password });
    }
    // Send HTTP request on click
    private _handleSubmit() {
        (async () => {
            try {
                if (this.props.isSignIn) {
                    // Reset error
                    this.setState({ error: null });
                    // Call server
                    const token = await getToken(this.state.email, this.state.password);
                    // Save token in window object
                    // (window as any).__token = token;
                    setAuthToken(token);
                    // Redirect to home page
                    this.props.history.push("/");
                } else {
                    // Reset error
                    this.setState({ error: null });
                    // Call server
                    await createUserAccount(this.state.email, this.state.password);
                    // Redirect to sign in page
                    this.props.history.push("/sign_in");
                }
            } catch(err) {
                this.setState({ error: err.error });
            }
        })();
    }
}

// withRouter pass some props that contain the history to the
// <SignInOrSignUpInternal> component and returns 
// a new component named <SignIn>
export const SignIn = withRouter(props => <SignInOrSignUpInternal isSignIn={true} {...props}/>);
export const SignUp = withRouter(props => <SignInOrSignUpInternal isSignIn={false} {...props}/>);

async function getToken(email: string, password: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const data = {
                email: email,
                password: password
            };
            const response = await fetch(
                "/api/v1/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json.token);
            } else {
                reject(json);
            }
        })();
    });
}


async function createUserAccount(email: string, password: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const data = {
                email: email,
                password: password
            };
            const response = await fetch(
                "/api/v1/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json.token);
            } else {
                reject(json);
            }
        })();
    });
}