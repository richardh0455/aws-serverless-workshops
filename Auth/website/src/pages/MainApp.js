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
const getAllPath = '/all';

const productsAPI = 'ProductsAPI';

const createOrderPath = '/create';
const orderAPI = 'OrderAPI';

class MainApp extends React.Component {
  constructor(props) {
    super(props);
    
    var shippingAddress = localStorage.getItem('shippingAddress');
    
    var customer = JSON.parse(localStorage.getItem('customer'));
    this.state = {
      authToken: null,
      idToken: null,
      customer: customer,
      shippingAddress:shippingAddress
    };
  }
  
  setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
  }

  async componentDidMount() {
    const session = await Auth.currentSession();
    this.setState({ authToken: session.accessToken.jwtToken });
    this.setState({ idToken: session.idToken.jwtToken });
    const customers = await this.getCustomers();
    this.setState({customers: customers.body});
    
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
    return await API.get(customersAPI, getAllPath, apiRequest)
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
      return await API.post(orderAPI, createOrderPath, apiRequest)
  }
  
  

  
  async handleCustomerChange(event) {
      
      
    var customer = await this.getCustomer(event.target.value);
    
    
    this.setState({customer: customer.body})
    
    localStorage.setItem('customer', JSON.stringify(customer.body));

    this.changeSelectedShippingAddress(-1);

  }
  
  handleShippingAddressChange(event) {
    this.changeSelectedShippingAddress(event.target.value)
  }
  
  changeSelectedShippingAddress(id) {
    this.setState({shippingAddress: id})
    localStorage.setItem('shippingAddress', id);
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
  
  

  render() {    
    var currentlySelectedCustomer = null;
    if(this.state.customer){
        currentlySelectedCustomer = JSON.parse(this.state.customer);
    }    
    
    var currentlySelectedCustomerID = '-1'
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
                <select value={currentlySelectedCustomerID} onChange={this.handleCustomerChange.bind(this)} >
                  <option key='-1' value="-1">Select a customer</option>
                  {this.generateCustomerList()}
                </select>
              </div>
              <div data-field-span="1" >
                <label>Shipping Address</label>
                <select value={currentlySelectedShippingAddressID} onChange={this.handleShippingAddressChange.bind(this)}>
                  <option key='-1' value="-1">Select a Shipping Address</option>
                  {shippingAddresses}

                </select>
              </div>
            </div>
            <div className="OrderList" style={{marginTop: 50 + 'px'}}>
                <OrderList create_invoice_handler={this.createInvoice.bind(this)} />
            </div>
        </fieldset>
        </form>
      </section>
      </div>
      );
  }
  


}

export default MainApp;
