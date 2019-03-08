/*
 *   Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 *  Licensed under the Apache License, Version 2.0 (the "License").
 *  You may not use this file except in compliance with the License.
 *  A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the "license" file accompanying this file. This file is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *  express or implied. See the License for the specific language governing
 *  permissions and limitations under the License.
 */
import React from 'react';
import { Auth} from 'aws-amplify';
import DynamicImage from '../components/DynamicImage';
import { withRouter } from 'react-router-dom';
import logo from '../public/images/LTLogo.png';
import '../public/css/app.css';
//import AmplifyStorage from './AmplifyStorage';
import { AmplifyStorage } from './AmplifyStorage';
/**
 * Sign-in Page
 */
class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: 0,
      email: '',
      password: '',
      code: '',
      userObject: null
    };
	console.log("Configuring Storage");
	Auth.configure({
		cookieStorage: {
        // REQUIRED - Cookie domain (only required if cookieStorage is provided)
            domain: '.logtagorders.com',
        // OPTIONAL - Cookie path
            path: '/',
        // OPTIONAL - Cookie expiration in days
            expires: 1,
        // OPTIONAL - Cookie secure flag
        // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
            secure: true
        }
	});
	
  }
  
  async componentDidMount() {
    this.checkCookie();
	
	
    
  }
  
  
  checkCookie() {
	//const user = await Auth.currentSession();
	const user = ""
	if (user != "") {
		this.props.history.replace('/app');
	}
  }

  async onSubmitForm(e) {
    e.preventDefault();
    this.performSignIn();
  }
  
  async performSignIn() {
	try {
		//console.log('Signing In');
        const userObject = await Auth.signIn(
          this.state.email,
          this.state.password
        );
        //console.log('userObject', userObject);
        if (userObject.challengeName) {
          // Auth challenges are pending prior to token issuance
          this.setState({ userObject, stage: 1 });
        } else {
          // No remaining auth challenges need to be satisfied
          const session = await Auth.currentSession();
          //console.log('Cognito User Access Token:', session.getAccessToken().getJwtToken());
          //console.log('Cognito User Identity Token:', session.getIdToken().getJwtToken());
          //console.log('Cognito User Refresh Token', session.getRefreshToken().getToken());
		  
          this.setState({ stage: 0, email: '', password: '', code: '' });
          //this.props.history.replace('/app');
        }
    } catch (err) {
        alert(err.message);
        console.error('Auth.signIn(): ', err);
    }  
	  
  }


  

  
  

  async onSubmitVerification(e) {
    e.preventDefault();
    try {
      const data = await Auth.confirmSignIn(
        this.state.userObject,
        this.state.code
      );
      console.log('Cognito User Data:', data);
      const session = await Auth.currentSession();
      // console.log('Cognito User Access Token:', session.getAccessToken().getJwtToken());
      console.log('Cognito User Identity Token:', session.getIdToken().getJwtToken());
      // console.log('Cognito User Refresh Token', session.getRefreshToken().getToken());
      this.setState({ stage: 0, email: '', password: '', code: '' });
      this.props.history.replace('/app');
    } catch (err) {
      alert(err.message);
      console.error('Auth.confirmSignIn(): ', err);
    }
  }

  onEmailChanged(e) {
    this.setState({ email: e.target.value.toLowerCase() });
  }

  onPasswordChanged(e) {
    this.setState({ password: e.target.value });
  }

  onCodeChanged(e) {
    this.setState({ code: e.target.value });
  }

  isValidEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  renderSignIn() {
    const isValidEmail = this.isValidEmail(this.state.email);
    const isValidPassword = this.state.password.length > 6;

    return (
      <div className="app">
        <header>
          <img src={logo}/>
        </header>
        <section className="form-wrap">
          <h1>Sign in</h1>
          <form id="registrationForm" onSubmit={(e) => this.onSubmitForm(e)}>
            <input className={isValidEmail?'valid':'invalid'} type="email" placeholder="Email" value={this.state.email} onChange={(e) => this.onEmailChanged(e)}/>
            <input className={isValidPassword?'valid':'invalid'} type="password" placeholder="Password" value={this.state.password} onChange={(e) => this.onPasswordChanged(e)}/>
			<input disabled={!(isValidEmail && isValidPassword)} type="submit" value="Sign In"/>
          </form>
		  <div id="buttonContainer">
			<p id="portal">Don't have an account?</p>
			<a href="/register">Register Here</a>
		  </div>
        </section>
      </div>
    );
  }

  renderConfirm() {
    const isValidEmail = this.isValidEmail(this.state.email);
    const isValidCode = this.state.code.length === 6;

    return (
      <div className="app">
        <header>
          <img src={logo}/>
        </header>
        <section className="form-wrap">
          <h1>Enter MFA Code</h1>
          <form id="verifyForm" onSubmit={(e) => this.onSubmitVerification(e)}>
            <input className={isValidEmail?'valid':'invalid'} type="email" placeholder="Email" value={this.state.email}/>
            <input className={isValidCode?'valid':'invalid'} type="text" placeholder="Verification Code" value={this.state.code} onChange={(e) => this.onCodeChanged(e)}/>
            <input disabled={!(isValidCode&&isValidEmail)} type="submit" value="Verify"/>
          </form>
        </section>
      </div>
    );
  }

  render() {
    switch (this.state.stage) {
      case 0:
      default:
        return this.renderSignIn();
      case 1:
        return this.renderConfirm();
    }
  }
}

export default withRouter(SignIn);

