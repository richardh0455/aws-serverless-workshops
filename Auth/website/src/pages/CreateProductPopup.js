import React from 'react';
import logo from '../public/images/LTLogo.png';
import { withRouter } from 'react-router-dom';
import {NotificationContainer, NotificationManager} from 'react-notifications';

class CreateProductPopup extends React.Component{
  
  constructor(props) {
    super(props);
    
    this.state = {
      name: '',
      description: '',
      cost_price: '0'
    };
	this.handleNameChange = this.handleNameChange.bind(this);
	this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
	this.handlePriceChange = this.handlePriceChange.bind(this);
	
  }
  
  async componentDidMount() {
    const session = JSON.parse(sessionStorage.getItem("session"));
    this.setState({ authToken: session.accessToken.jwtToken });
    this.setState({ idToken: session.idToken.jwtToken });

    
  }
  
  async handleNameChange(event) {
  
    this.setState({name: event.target.value})  

  }
  async handleDescriptionChange(event) {
  
    this.setState({description: event.target.value})  

  }
  async handlePriceChange(event) {
  
    this.setState({cost_price: event.target.value})  

  }
  
  async createProduct(e) { 
	const response = this.props.create_product_handler(e, {name:this.state.name, description:this.state.description, cost_price:this.state.cost_price  }); 
	if(response) {
		this.setState({
			name:'',
			description:'',
			cost_price:'0'
		})
	}	
  }
  
  
  
  render() {
    return (
      <div >
      <section>
        <form className="grid-form">
          <fieldset>
			<div data-row-span="2">
            <div data-field-span="1">
				<label>Product Name</label>
				<input type="text" value={this.state.name} onChange={this.handleNameChange} />
			</div>
			<div data-field-span="1">
				<label>Description</label>
				<input type="text" value={this.state.description} onChange={this.handleDescriptionChange} />
			</div>
			</div>
			<div data-row-span="1">
			<div data-field-span="1">
				<label>Cost Price</label>
				<input type="text" value={this.state.cost_price}  onChange={this.handlePriceChange} />
			</div>
			</div>

        </fieldset>
		<div >
			<button onClick={(e) => {this.createProduct(e)} }>Create Product</button>
		</div>
        </form>
		<NotificationContainer/>
      </section>
	  
	  
      </div>
    );
  }
}

export default withRouter(CreateProductPopup);