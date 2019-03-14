import React from 'react';
import logo from '../public/images/LTLogo.png';
import Amplify from 'aws-amplify';
import '../public/css/app.css';
import '../public/css/gridforms.css';

import { Auth, API } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { withRouter} from 'react-router-dom'

class CreateCustomerPopup extends React.Component {
  constructor(props) {
    super(props);
	
	this.state = {
      authToken: null,
      idToken: null
    };
  }
  
  async componentDidMount() {
    /*Auth.currentSession()
    .then(data => {
			this.setState({ authToken: data.accessToken.jwtToken });
			this.setState({ idToken: data.idToken.jwtToken });
		})
    .catch(err =>{
		console.log('CreateCustomerPopup')
		console.log(err)
	}
	);*/
	
	const authedUser = await Auth.currentAuthenticatedUser();
    console.log(authedUser) 
    
    
  }
  
  async handleRegionChange(event) {
  
    this.setState({region: event.target.value})  

  }
  
  render() {
	  
    return (
      <div className="app">
    <header>
          <img src={logo}/>
        </header>
      <section>
        <form className="grid-form">
          <fieldset>
            <h2>Create Customer</h2>
			<div data-row-span="2">
            <div data-field-span="1">
				<label>First Name</label>
				<input type="text" defaultValue="First Name"  />
			</div>
			<div data-field-span="1">
				<label>Last Name</label>
				<input type="text" defaultValue="Last Name" />
			</div>
			</div>
			<div data-row-span="2">
			<div data-field-span="1">
				<label>Billing Address</label>
				<input type="text" defaultValue="Billing Address"  />
			</div>
			<div data-field-span="1">
				<label>Region</label>
				<select onChange={this.handleRegionChange.bind(this)}>
                  <option key='1' value="NZ">Select a Region</option>
                  <option key='2' value="SA">South America</option>
                  <option key='3' value="NA">North America</option>
                  <option key='4' value="EU">Europe</option>
                  <option key='5' value="AP">Asia Pacific</option>
                  <option key='6' value="ME">Middle East</option>
                  
                </select>
			</div>
			</div>
        </fieldset>
        </form>
      </section>
	  
	  
      </div>
    );
  }
}

export default withRouter(CreateCustomerPopup);