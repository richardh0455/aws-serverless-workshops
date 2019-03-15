import React from 'react';
import logo from '../public/images/LTLogo.png';
import { withRouter } from 'react-router-dom'

class CreateCustomerPopup extends React.Component{
  
  constructor(props) {
    super(props);
    
    this.state = {
      name: '',
      region: '',
      email: '',
      address: ''
    };
	this.handleRegionChange = this.handleRegionChange.bind(this);
	this.handleNameChange = this.handleNameChange.bind(this);
	this.handleEmailChange = this.handleEmailChange.bind(this);
	this.handleAddressChange = this.handleAddressChange.bind(this);
	
  }
  
  async componentDidMount() {
    const session = JSON.parse(sessionStorage.getItem("session"));
    this.setState({ authToken: session.accessToken.jwtToken });
    this.setState({ idToken: session.idToken.jwtToken });

    
  }
  
  async handleRegionChange(event) {
  
    this.setState({region: event.target.value})  

  }
  async handleNameChange(event) {
  
    this.setState({name: event.target.value})  

  }
  async handleEmailChange(event) {
  
    this.setState({email: event.target.value})  

  }
  async handleAddressChange(event) {
  
    this.setState({address: event.target.value})  

  }
  async nameOnFocus() {
	if(this.state.name === 'Name' || this.state.name === '') { this.value = ''; }  
	  
  }

  
  async createCustomer(e) { 
	this.props.create_customer_handler(e, {name:this.state.name,email:this.state.email, address:this.state.address,region:this.state.region  });  
  }
  
  
  
  render() {
    return (
      <div >
      <section>
        <form className="grid-form">
          <fieldset>
			<div data-row-span="2">
            <div data-field-span="1">
				<label>Name</label>
				<input type="text" onChange={this.handleNameChange} />
			</div>
			<div data-field-span="1">
				<label>Email</label>
				<input type="text" onChange={this.handleEmailChange} />
			</div>
			</div>
			<div data-row-span="2">
			<div data-field-span="1">
				<label>Billing Address</label>
				<input type="text" onChange={this.handleAddressChange} />
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
		<div >
			<button onClick={(e) => {this.createCustomer(e)} }>Create Customer</button>
		</div>
        </form>
      </section>
	  
	  
      </div>
    );
  }
}

export default withRouter(CreateCustomerPopup);