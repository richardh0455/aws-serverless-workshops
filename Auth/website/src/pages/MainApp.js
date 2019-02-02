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

const customersAPI = 'CustomersAPI';
const apiPath = '/all';

const productsAPI = 'ProductsAPI';

class MainApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authToken: null,
      idToken: null,
      requestRideEnabled: false,
	  customer: null
    };
  }

  async componentDidMount() {
    const session = await Auth.currentSession();
    this.setState({ authToken: session.accessToken.jwtToken });
    this.setState({ idToken: session.idToken.jwtToken });
	const customers = await this.getCustomers();
	this.setState({customers: customers.body})
	const products = await this.getProducts();
	this.setState({products: products.body})
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
  async getProducts() {
	const apiRequest = {
      headers: {
        'Authorization': this.state.idToken,
        'Content-Type': 'application/json'
      }
    };
	return await API.get(productsAPI, apiPath, apiRequest)
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
	console.log(event.target.value);
	var customer = await this.getCustomer(event.target.value);
	console.log(customer.body)
	this.setState({customer: customer.body})
  }
  
  handleProductChange(event) {
	console.log(event.target.value);
	var productConfig = this.getProductConfig(event.target.value);
	console.log(productConfig);
  }

  async onClick() {

  }


  render() {
	var products = [];
	if(this.state.products){
		products = JSON.parse(this.state.products);
	}
	let productOptions = null;
	try{
		productOptions = products.map((product) =>
                <option key={product.ID} value={product.ID}>{product.Name}</option>
            );  
	}catch(err)
	{
		console.log('Error rendering products: '+err);
	}
	
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

	var customer = 	JSON.parse(this.state.customer);
	
	
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
		console.log(customer.ShippingAddresses)
		shippingAddresses = customer.ShippingAddresses.map((address) => 
				<option key={address.ShippingAddressID} value={address.ShippingAddressID}>{address.ShippingAddress}</option>
			);
	}
    // If API is not configured, but auth is, then output the
    // token.
    return (
      <div>
	    <form className="grid-form">
          <fieldset>
            <legend >Customer</legend>
            <div data-row-span="2">
              <div data-field-span="1" >
                <label>Customer</label>
                <select onChange={this.handleCustomerChange.bind(this)} >
                  <option>Select a customer</option>
				  {customerOptions}
                </select>
              </div>
              <div data-field-span="1" >
                <label>Shipping Address</label>
                <select>
                  <option>Select a Shipping Address</option>
				  {shippingAddresses}

                </select>
              </div>
            </div>
            <legend >Product</legend>
            <div data-row-span="4">
              <div data-field-span="1" >
                <label>Product</label>
                <select onChange={this.handleProductChange.bind(this)}>
                  <option>Select a product type</option>
				  {productOptions}
                </select>
              </div>
              <div data-field-span="1" >
                <label>Configuration</label>
                <select>
                  <option>Select a product configuration</option>
				  {productConfigOptions}
                </select>
              </div>
              <div data-field-span="1" >
                <label>Quantity</label>
                <input type="text"/>
              </div>
              <div data-field-span="1" >
                <label>Pricing</label>
                <input type="text"/>
              </div>
              <div >
                <b >Subtotal:</b>   
              </div>    
            </div>
            <button >Add Product</button>
              <ul><li ><b>Total:</b></li></ul>
          </fieldset>
        </form>
      </div>
      );
  }
  


}

export default MainApp;
