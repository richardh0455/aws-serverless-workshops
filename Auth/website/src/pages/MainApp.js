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
import Select from 'react-select';


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
	
	this.handleCustomerChange = this.handleCustomerChange.bind(this);
	this.handleShippingAddressChange = this.handleShippingAddressChange.bind(this);
  }


  async componentDidMount() {
    const session = await Auth.currentSession();
	sessionStorage.setItem('session', JSON.stringify(session));
    this.setState({ authToken: session.accessToken.jwtToken });
    this.setState({ idToken: session.idToken.jwtToken });
    this.getCustomers();
    this.getProducts();
	
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
	}).catch(error => {
		console.log(error.response)
		if(error.response.status == 401){
			alert('Please Sign In')
			//this.props.history.replace('/signin');
		}
	});
  }
  
  async getProducts() {
	  const apiRequest = {
        headers: {
          'Authorization': this.state.idToken,
          'Content-Type': 'application/json'
        }
      };
	  API.get(productsAPI, getAllPath, apiRequest).then(response => {
		this.setState({products: response.body});
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
  


  

  async handleCustomerChange(event) { 
	this.setState({currentlySelectedCustomer: event})  
    var customer = await this.getCustomer(event.value);
    this.setState({customer: customer.body})
	this.handleShippingAddressChange(null);
  }
  
  handleShippingAddressChange(event) {
	this.setState({currentlySelectedShippingAddress: event})
  }
  
  

  generateCustomerList() {
    var customers = [];
    if(this.state.customers){
        customers = JSON.parse(this.state.customers);
    } 
    
    let customerOptions = [];
    try{
        customerOptions = customers.map((customer) =>
		{return {value:customer.ID, label: customer.Name}}
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
			{return {value:address.ShippingAddressID, label: address.ShippingAddress}}
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
  
  render() {    
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
                <Select value={this.state.currentlySelectedCustomer} onChange={this.handleCustomerChange} options={this.generateCustomerList()} isSearchable="true" placeholder="Select a Customer"/>
              </div>
              <div data-field-span="1" >
                <label>Shipping Address</label>
                <Select value={this.state.currentlySelectedShippingAddress} onChange={this.handleShippingAddressChange} options={this.generateShippingAddressList(JSON.parse(this.state.customer))} placeholder="Select a Shipping Address"/>
              </div>
            </div>
            <div className="OrderList" style={{marginTop: 50 + 'px'}}>
				<h2>Product</h2>
                <OrderList create_invoice_handler={this.createInvoice.bind(this)} products={this.state.products}/>
            </div>
        </fieldset>
        </form>
      </section>
	  <Accordian>
		<div label="Create Customer">
			<CreateCustomerPopup get_all_customers={this.getCustomers.bind(this)}/>
		</div>	
        <div label='Create Product'>
          <CreateProductPopup get_all_products={this.getProducts.bind(this)} />
		</div>	
      </Accordian>
	  
	  
	  
      </div>
      );
  }
  


}

export default withRouter(MainApp);
