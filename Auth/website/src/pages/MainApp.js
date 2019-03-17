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
import Amplify from 'aws-amplify';
import { Auth, API } from 'aws-amplify';
import awsConfig from '../amplify-config';
import '../public/css/app.css';
import '../public/css/gridforms.css';
import logo from '../public/images/LTLogo.png';
import OrderList from './OrderList';
import CreateCustomerPopup  from './CreateCustomerPopup';
import CreateProductPopup  from './CreateProductPopup';
import Accordian  from './Accordian';
import { withRouter, Link } from 'react-router-dom';
import {NotificationContainer, NotificationManager} from 'react-notifications';

const customersAPI = 'CustomersAPI';
const getAllPath = '/all';

const productsAPI = 'ProductsAPI';

const createPath = '/create';
const orderAPI = 'OrderAPI';

class MainApp extends React.Component {
  constructor(props) {
    super(props);
	
	Amplify.Logger.LOG_LEVEL = 'DEBUG';
    
    this.state = {
      authToken: null,
      idToken: null,
      customer: null,
      shippingAddress:null,
	  showProductPopup: false,
	  showCustomerPopup: false
    };
  }


  async componentDidMount() {
    const session = await Auth.currentSession();
	sessionStorage.setItem('session', JSON.stringify(session));
	console.log(session);
    this.setState({ authToken: session.accessToken.jwtToken });
    this.setState({ idToken: session.idToken.jwtToken });
    const customers = await this.getCustomers();
    
  }
  
  componentWillUnmount() {
        localStorage.clear();
    }

  /**
   * Determines if the API is enabled
   *
   * @return {Boolean} true if API is configured
   */
  hasApi() {
     const api = awsConfig.API.endpoints.filter(v => v.endpoint !== '');                                                   
     return (typeof api !== 'undefined');
  }

  
  async getProductConfig(id) {
    const apiRequest = {
      headers: {
        'Authorization': this.state.idToken,
        'Content-Type': 'application/json'
      }
    };
    return await API.get(productsAPI, '/'+id, apiRequest)
  }  

  async getCustomers() {
    const apiRequest = {
      headers: {
        'Authorization': this.state.idToken,
        'Content-Type': 'application/json'
      }
    };
    API.get(customersAPI, getAllPath, apiRequest).then(response => {
		this.setState({customers: response.body});
		return response.body
	}).catch(error => {
		console.log(error.response)
		if(error.response.status == 401){
			alert('Please Sign In')
			//this.props.history.replace('/signin');
		}
	});
  }
  
  async getCustomer(id) {
    const apiRequest = {
      headers: {
        'Authorization': this.state.idToken,
        'Content-Type': 'application/json'
      }
    };
    return await API.get(customersAPI, '/'+id, apiRequest)
  }
   
  
  async createInvoice(invoiceLines) {
        const apiRequest = {
        headers: {
          'Authorization': this.state.idToken,
          'Content-Type': 'application/json'
        },
        body: {"customerID": JSON.parse(this.state.customer).ContactInfo.CustomerID, "invoiceLines": invoiceLines}
      };
      return await API.post(orderAPI, createPath, apiRequest)
  }
  
  async createCustomer(e, customer) {
	e.preventDefault();
    const apiRequest = {
        headers: {
          'Authorization': this.state.idToken,
          'Content-Type': 'application/json'
        },
        body: {"Name": customer.name, "EmailAddress": customer.email, "BillingAddress": customer.billing_address, "Region": customer.region}
    };
    const success = API.post(customersAPI, createPath, apiRequest)
	  .then(response => {
		
		var customerID = JSON.parse(JSON.parse(response.body))["CustomerID"];
		const success = this.createShippingAddresses(customerID, customer.shipping_addresses);
		console.log('Shipping Address creation done');
		console.log(success);
		if(success)
		{
			NotificationManager.success('', 'Customer Successfully Created');
			return true;
		}else {
			
			NotificationManager.error('Creating Customer Shipping Addresses Failed', 'Error', 5000, () => {});
			return false;
		}
		
	  })
	  .catch(err => {
		console.log(err);
		NotificationManager.error('Customer creation Failed', 'Error', 5000, () => {});
		return false;	
	  })
	return success;	
  }

  async createShippingAddresses(customerID, shipping_addresses) {
	for(var index = 0; index < shipping_addresses.length; index++) {
		var result = await this.createShippingAddress(customerID, shipping_addresses[index].value);
		if(!result) {
			return false;			
		}
	}
	return true;
	  
  }

  async createShippingAddress(customerID, shipping_address) {
	console.log("Sutomer: "+customerID+ "Shipping Address:"+ shipping_address);
	const apiRequest = {
        headers: {
          'Authorization': this.state.idToken,
          'Content-Type': 'application/json'
        },
        body:{"ShippingAddress": shipping_address}
      };
      const success = API.post(customersAPI, "/"+customerID+"/shipping-addresses/create", apiRequest)
	  .then(response => {
		return true;
	  })
	  .catch(err => {
		NotificationManager.error('Address creation Failed', 'Error', 5000, () => {});
		return false;
	  })
	  
	  return success;  
  }
  
  
  
  
  async createProduct(e, product) {
	  e.preventDefault();
        const apiRequest = {
        headers: {
          'Authorization': this.state.idToken,
          'Content-Type': 'application/json'
        },
        body: {"Name": product.name, "Description": product.description, "CostPrice":product.cost_price}
      };
      const success = API.post(productsAPI, createPath, apiRequest)
	  .then(response => {
		NotificationManager.success('', 'Product Successfully Created'); 
		return true;
	  })
	  .catch(err => {
		NotificationManager.error('Product creation Failed', 'Error', 5000, () => {});
		return false;
	  })
	  
	  return success;
  }

  async handleCustomerChange(event) {
      
      
    var customer = await this.getCustomer(event.target.value);
    
    
    this.setState({customer: customer.body})
    

    this.changeSelectedShippingAddress(-1);

  }
  
  handleShippingAddressChange(event) {
    this.changeSelectedShippingAddress(event.target.value)
  }
  
  changeSelectedShippingAddress(id) {
    this.setState({shippingAddress: id})

  }

  generateCustomerList() {
    var customers = [];
    if(this.state.customers){
        customers = JSON.parse(this.state.customers);
    } 
    
    let customerOptions = [];
    try{
        customerOptions = customers.map((customer) =>
                <option key={customer.ID} value={customer.ID}>{customer.Name}</option>
            );
    }catch(err)
    {
        console.log('Error rendering Customers: '+err);
    }
    return customerOptions;
      
  }
  
  generateShippingAddressList(customer) {
    let shippingAddresses = [];        
    if(customer && "ShippingAddresses" in customer){
        shippingAddresses = customer.ShippingAddresses.map((address) => 
                <option key={address.ShippingAddressID} value={address.ShippingAddressID}>{address.ShippingAddress}</option>
            );
    }  
    return shippingAddresses;  
  }
  
  togglePopup(name) {
	console.log('Toggle popup');  
	console.log(name);  
	console.log(!this.state[name]);  
    this.setState({
      [name]: !this.state[name]
    });
  }
  
  toggleProductPopup() {
	//this.togglePopup('showProductPopup');
	this.props.history.replace('/product');
  }
  
  toggleCustomerPopup() {
	//this.togglePopup('showCustomerPopup');
	this.props.history.replace('/customer');
  }

  render() {    
    var currentlySelectedCustomer = null;

    if(this.state.customer){
        currentlySelectedCustomer = JSON.parse(this.state.customer);
    }    
    
    var currentlySelectedCustomerID = '0'
    if(currentlySelectedCustomer && "ContactInfo" in currentlySelectedCustomer)
    {
        currentlySelectedCustomerID = currentlySelectedCustomer.ContactInfo.CustomerID;
    }
    
    var shippingAddresses =this.generateShippingAddressList(currentlySelectedCustomer);
    var currentlySelectedShippingAddressID = '-1'
    if(shippingAddresses.length == 1) {
        currentlySelectedShippingAddressID = currentlySelectedCustomer.ShippingAddresses[0].ShippingAddressID
    }
    else if(this.state.shippingAddress)
    {
        currentlySelectedShippingAddressID = this.state.shippingAddress;
    }

    return (
    <div className="app">
    <header>
          <img src={logo}/>
        </header>
      <section>
        <form className="grid-form">
          <fieldset>
            <h2>Customer</h2>
            <div data-row-span="2">
              <div data-field-span="1" >
                <label>Customer</label>
                <select onChange={this.handleCustomerChange.bind(this)} >
				  <option value="" disabled selected >Select a customer</option>
                  {this.generateCustomerList()}
                </select>
              </div>
              <div data-field-span="1" >
                <label>Shipping Address</label>
                <select onChange={this.handleShippingAddressChange.bind(this)}>
                  <option value="" disabled selected >Select a Shipping Address</option>
                  {shippingAddresses}

                </select>
              </div>
            </div>
            <div className="OrderList" style={{marginTop: 50 + 'px'}}>
				<h2>Product</h2>
                <OrderList create_invoice_handler={this.createInvoice.bind(this)} />
            </div>
        </fieldset>
        </form>
      </section>
	  <Accordian>
		<div label="Create Customer">
			<CreateCustomerPopup create_customer_handler={this.createCustomer.bind(this)} />
		</div>	
        <div label='Create Product'>
          <CreateProductPopup create_product_handler={this.createProduct.bind(this)} />
		</div>	
      </Accordian>
	  
	  
	  
      </div>
      );
  }
  


}

export default withRouter(MainApp);
