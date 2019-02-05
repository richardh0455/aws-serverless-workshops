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
import BaseMap from '../components/BaseMap';
import ESRIMap from '../components/ESRIMap';
import Amplify from 'aws-amplify';
import { Auth, API } from 'aws-amplify';
import awsConfig from '../amplify-config';
import '../public/css/app.css';
import '../public/css/gridforms.css';
import logo from '../public/images/LTLogo.png';
import OrderList from './OrderList';

const customersAPI = 'CustomersAPI';
const apiPath = '/all';

const productsAPI = 'ProductsAPI';

class MainApp extends React.Component {
  constructor(props) {
    super(props);
	var customer = JSON.parse(localStorage.getItem('customer'));
	var shippingAddress = localStorage.getItem('shippingAddress');
	
    this.state = {
      authToken: null,
      idToken: null,
	  customer: customer,
	  shippingAddress:shippingAddress
    };
  }

  async componentDidMount() {
    const session = await Auth.currentSession();
    this.setState({ authToken: session.accessToken.jwtToken });
    this.setState({ idToken: session.idToken.jwtToken });
	const customers = await this.getCustomers();
	this.setState({customers: customers.body})
	
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
	return await API.get(customersAPI, apiPath, apiRequest)
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
  

  
  async handleCustomerChange(event) {
	var customer = await this.getCustomer(event.target.value);
	this.setState({customer: customer.body})
	
	localStorage.setItem('customer', JSON.stringify(customer.body));
	console.log('Customer Change');
	console.log(JSON.stringify(customer.body));
	
	this.changeSelectedShippingAddress(-1);

  }
  
  handleShippingAddressChange(event) {
	this.changeSelectedShippingAddress(event.target.value)
  }
  
  changeSelectedShippingAddress(id) {
	this.setState({shippingAddress: id})
	localStorage.setItem('shippingAddress', id);
  }
  

  
  async onClick() {

  }
  

  render() {
	
	
	var productConfigs = [];
	if(this.state.productConfigs){
		productConfigs = JSON.parse(this.state.productConfigs);
	}
	let productConfigOptions = null;
	try{
		productConfigOptions = productConfigs.map((productConfig) =>
                <option key={productConfig.ID} value={productConfig.ID}>{productConfig.Name}</option>
            );  
	}catch(err)
	{
		console.log('Error rendering products: '+err);
	}
	
	var customers = [];
	
	if(this.state.customers){
		customers = JSON.parse(this.state.customers);
	}

	var customer = null;
	if(this.state.customer){
		customer = JSON.parse(this.state.customer);
	}	
	
	
	let customerOptions = null;
	try{
		customerOptions = customers.map((customer) =>
                <option key={customer.ID} value={customer.ID}>{customer.Name}</option>
            );
	}catch(err)
	{
		console.log('Error rendering Customers: '+err);
	}
			
	let shippingAddresses = [];		
	if(customer && "ShippingAddresses" in customer){
		shippingAddresses = customer.ShippingAddresses.map((address) => 
				<option key={address.ShippingAddressID} value={address.ShippingAddressID}>{address.ShippingAddress}</option>
			);
	}
	//console.log("ShippingAddresses");
	//console.log(JSON.stringify(customer.ShippingAddresses[0]));

	var customerValue = '-1'
	if(customer && "ContactInfo" in customer)
	{
		customerValue = customer.ContactInfo.CustomerID;
	}
	
	var shippingAddress = '-1'
	if(shippingAddresses.length == 1) {
		shippingAddress = customer.ShippingAddresses[0].ShippingAddressID
	}
	else if(this.state.shippingAddress)
	{
		shippingAddress = this.state.shippingAddress;
	}
	console.log("ShippingAddress");
	console.log(shippingAddress);
	
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
                <select value={customerValue} onChange={this.handleCustomerChange.bind(this)} >
                  <option key='-1' value="-1">Select a customer</option>
				  {customerOptions}
                </select>
              </div>
              <div data-field-span="1" >
                <label>Shipping Address</label>
                <select value={shippingAddress} onChange={this.handleShippingAddressChange.bind(this)}>
                  <option key='-1' value="-1">Select a Shipping Address</option>
				  {shippingAddresses}

                </select>
              </div>
            </div>
			<div className="OrderList" style={{marginTop: 50 + 'px'}}>
				<OrderList />
			</div>
		</fieldset>
        </form>
      </section>
	  </div>
      );
  }
  


}

export default MainApp;
