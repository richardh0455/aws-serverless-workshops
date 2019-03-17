import React from 'react';
import logo from '../public/images/LTLogo.png';
import { withRouter } from 'react-router-dom';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import ShippingAddress from './ShippingAddress'


class CreateCustomerPopup extends React.Component{
  
  constructor(props) {
    super(props);
    
    this.state = {
      name: '',
      region: '',
      email: '',
      billing_address: '',
	  shipping_addresses:[{key:'0',  value:''}],
	  counter:'0'
    };
	this.handleRegionChange = this.handleRegionChange.bind(this);
	this.handleNameChange = this.handleNameChange.bind(this);
	this.handleEmailChange = this.handleEmailChange.bind(this);
	this.handleBillingAddressChange = this.handleBillingAddressChange.bind(this);
	this.shippingAddressUpdated = this.shippingAddressUpdated.bind(this);
	this.addShippingAddress = this.addShippingAddress.bind(this);
	
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
  async handleBillingAddressChange(event) {
  
    this.setState({billing_address: event.target.value})  

  }
  async nameOnFocus() {
	if(this.state.name === 'Name' || this.state.name === '') { this.value = ''; }  
	  
  }

  
  async createCustomer(e) { 	
	const response = await this.props.create_customer_handler(e, {name:this.state.name,email:this.state.email, billing_address:this.state.billing_address,region:this.state.region, shipping_addresses:this.state.shipping_addresses  }); 
	
	console.log(response);
	if(response) {
		this.setState({
			billing_address:'',
			email:'',
			name:'',
			region:'',
			shipping_addresses:[{key:'0',  value:''}],
			counter:'0'
		})
	}
  }
  
  shippingAddressUpdated(key, item) {
	   var addresses = this.state.shipping_addresses;
	   for(var i = 0; i < addresses.length; i++) {
		if(addresses[i].key === key) {
			if(item == null){
				addresses.splice(i, 1);
			}else {
				addresses[i].value = item
			}
		}
	  }
	  this.setState({shipping_addresses: addresses});
   }
   
   addShippingAddress(event) {
	event.preventDefault();   
	var key = Number(this.state.counter) + 1;
	var default_item = {key:'0', value:''};
	var cloneOfDefault = JSON.parse(JSON.stringify(default_item));
	cloneOfDefault.key = key;
	var shipping_addresses = this.state.shipping_addresses;
	shipping_addresses.push(cloneOfDefault);
	this.setState({counter: key, shipping_addresses: shipping_addresses });   
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
				<input type="text" value={this.state.name}  onChange={this.handleNameChange} />
			</div>
			<div data-field-span="1">
				<label>Email</label>
				<input type="text" value={this.state.email}  onChange={this.handleEmailChange} />
			</div>
			</div>
			<div data-row-span="2">
			<div data-field-span="1">
				<label>Billing Address</label>
				<input type="text" value={this.state.billing_address}  onChange={this.handleBillingAddressChange} />
			</div>
			<div data-field-span="1">
				<label>Region</label>
				<select value={this.state.region} onChange={this.handleRegionChange.bind(this)}>
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
		<fieldset>
			{this.state.shipping_addresses.map(address => (
				<ShippingAddress address={address} update_address_handler={this.shippingAddressUpdated} />
			))}
			<button onClick={this.addShippingAddress}>Add Shipping Address</button>
		
		</fieldset>
		<div >
			<button style={{marginTop: 50 + 'px'}}onClick={(e) => {this.createCustomer(e)} }>Create Customer</button>
		</div>
        </form>
		<NotificationContainer/>
      </section>
	  
	  
      </div>
    );
  }
}

export default withRouter(CreateCustomerPopup);