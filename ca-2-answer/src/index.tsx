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
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Switch, Route, Link} from "react-router-dom";
import { Links } from "./pages/links";
import { LinkDetails } from './pages/link_details';
import { SignIn, SignUp } from './pages/login';
import { Profile } from './pages/profile';
import { PageHeader } from "./components/page_header/page_header";
import {UserDetails} from "./components/user_details/user_details";


ReactDOM.render(
    // This is the router component
    <BrowserRouter>
    
        {
            /*
                This is how you do a comment in JSX!
            */
        }
        <div>
           
            <PageHeader/>
            { 
                /*
                    The Switch component will render one of the components
                    The rendered component will be the one in the Route with
                    the matching path
                */
                      
            }
         <div className="container">
              
                <Switch>
                    {
                        /*
                            The Route component can be used to declare the 
                            pages in our single page web application
                        */
                    }
                    <Route exact path="/" component={Links} />
                    <Route exact path="/link_details/:id" component={LinkDetails} />
                    <Route exact path="/sign_in" component={SignIn} />
                    <Route exact path="/sign_up" component={SignUp} />
                    <Route exact path="/profile" component={Profile} />
                    <Route exact path="/profile/:id" component={Profile} />
                    <Route exact={true} path="/user_details/:id" component={UserDetails} />
                </Switch>
            </div>
        </div>
       
    </BrowserRouter>,

    
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
