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

const apiName = 'CustomersAPI';
const apiPath = '/all';

class MainApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authToken: null,
      idToken: null,
      requestRideEnabled: false,
      updates: [
        'Welcome! Click the map to set your pickup location.'
      ]
    };
  }

  async componentDidMount() {
    const session = await Auth.currentSession();
    this.setState({ authToken: session.accessToken.jwtToken });
	console.log('MainApp session token: '+session.idToken.jwtToken);
    this.setState({ idToken: session.idToken.jwtToken });
	
	const customers = await this.getData();
	console.log(customers.body);
	this.setState({customers: customers.body})
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

  /**
   * Calls the backend API to retrieve the Unicorn data
   *
   * @param {Number} latitude
   * @param {Number} longitude
   */
  async getData() {
	const apiRequest = {
      headers: {
        'Authorization': this.state.idToken,
        'Content-Type': 'application/json'
      }
    };
	return await API.get(apiName, apiPath, apiRequest)
  }

  /**
   * Called when Request Ride is called
   */
  async onClick() {
    if (!this.state.pin) {
      console.error('No pin present - skipping');
      return true;
    }

    const updates = [ 'Requesting Unicorn' ];
    try {
      this.setState({
        requestRideEnabled: false,
        updates
      });
      const data = await this.getData(this.state.pin);
      console.log(data);
      updates.push([ `Your unicorn, ${data.Unicorn.Name} will be with you in ${data.Eta}` ]);
      this.setState({ updates });

      // Let's fake the arrival
      setTimeout(() => {
        console.log('Ride Complete');
        const updateList = this.state.updates;
        updateList.push([ `${data.Unicorn.Name} has arrived` ]);
        this.setState({
          updates: updateList,
          requestRideEnabled: false,
          pin: null
        });
      }, data.Eta * 1000);
    } catch (err) {
      console.error(err);
      updates.push([ 'Error finding unicorn' ]);
      this.setState({ updates });
    }
  }

  /**
   * Called when the mapClick happens
   * @param {Point} position the position of the map pin
   */
  onMapClick(position) {
    console.log(`onMapClick(${JSON.stringify(position)})`);
    this.setState({ pin: position, requestRideEnabled: true });
  }

  render() {
	var customers = [];
	if(this.state.customers){
		customers = JSON.parse(this.state.customers);
	}	
	
	let optionItems = customers.map((customer) =>
                <option key={customer.ID}>{customer.Name}</option>
            );
    // If API is not configured, but auth is, then output the
    // token.
    return (
      <div>
	    <form class="grid-form">
          <fieldset>
            <legend >Customer</legend>
            <div data-row-span="2">
              <div data-field-span="1" class="">
                <label>Customer</label>
                <select>
                  <option>Select a customer</option>
				  {optionItems}
                </select>
              </div>
              <div data-field-span="1" class="">
                <label>Shipping Address</label>
                <select>
                  <option>Select a Shipping Address</option>
                </select>
              </div>
            </div>
            <legend >Product</legend>
            <div data-row-span="4">
              <div data-field-span="1" class="">
                <label>Product</label>
                <select>
                  <option>Select a product type</option>
                </select>
              </div>
              <div data-field-span="1" class="">
                <label>Configuration</label>
                <select>
                  <option>Select a product configuration</option>
                </select>
              </div>
              <div data-field-span="1" class="">
                <label>Quantity</label>
                <input type="text"/>
              </div>
              <div data-field-span="1" class="">
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
