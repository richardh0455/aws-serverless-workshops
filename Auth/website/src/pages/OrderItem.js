import React, { Component } from 'react';
import '../public/css/gridforms.css';

const variants = [
  {key:-1, name: 'No Variant'},
  {key:1, name: 'Red Label'},
  {key:2, name: 'Red Label, Single Use'},
  {key:3, name: 'Green Label, Multi Use'},
];


class OrderItem extends Component {
  constructor(props) {
    super(props);
	var order_item = JSON.parse(localStorage.getItem(this.props.item.key));
    this.state = {
		product_name: order_item ? order_item.product_name : this.props.item.product_name, 
		product_id: order_item ? order_item.product_id : this.props.item.product_id, 
		variant: order_item ? order_item.variant : this.props.item.variant, 
		variant_id: order_item ? order_item.variant_id : this.props.item.variant_id, 
		quantity: order_item ? order_item.quantity : this.props.item.quantity, 
		price: order_item ? order_item.price : this.props.item.price,
		variants: variants
	};

    this.handleProductChange = this.handleProductChange.bind(this);
    this.handleVariantChange = this.handleVariantChange.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.handlePriceChange = this.handlePriceChange.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }	
  handleProductChange(event) {
	console.log('Product Changed');
	console.log(event.target.value);
	this.saveState({product_name: event.target.value, product_id: this.findProductID(event.target.value)});  
  }
  
  findProductID(product_name) {
	var products = this.props.products; 
	console.log("Looking for "+product_name);	
	console.log(JSON.stringify(products));
	for(var i = 0; i < products.length; i++) {
		if(product_name === products[i].name){
			console.log("Found match!");
			console.log(JSON.stringify(products[i]));
			return products[i].key;
		}
	}
	return "0"  
  }
  
  handleVariantChange(event) {
	this.saveState({variant: event.target.value, variant_id: this.findVariantID(event.target.value)});  
  }
  
  findVariantID(variant_name) {
	var variants = this.state.variants;  
	for(var i = 0; i < variants.length; i++) {
		if(variant_name === variants[i].name){
			return variants[i].key;
		}
	}
	return -1;  
  }
  
  handleQuantityChange(event) {
	this.saveState({quantity: event.target.value});  
  }
  
  handlePriceChange(event) {  
	this.saveState({price: event.target.value});  
  }
  
  removeItem(event) {
	event.preventDefault();
	this.props.update_item_handler(this.props.item.key, null)
  }
  
  onKeyPress(event) {
	  //this.props.on_key_press(this.props.item.key, event.which)
	  console.log('Registered Key press '+this.props.item.key+' '+event.which)  
    if (event.which === 13 /* Enter */) {
      console.log("Enter was Pressed");
	  event.preventDefault()
    }
  }
  

  
  saveState(state) {
	this.setState(state)   
	var order_item  = {product_name: this.state.product_name, product_id:this.state.product_id, variant: this.state.variant,variant_id: this.state.variant_id, quantity: this.state.quantity, price: this.state.price}
	for(var key in state){
      order_item[key] = state[key];
	} 
	this.props.update_item_handler(this.props.item.key, order_item)
	localStorage.setItem(this.props.item.key, JSON.stringify(order_item));
   }
	
  render() { 
    return (
      <div className onKeyPress={this.onKeyPress}>
        <div data-row-span="6">
			<div data-field-span="1">
				<label>Product</label>
				<select value={this.state.product_name} onChange={this.handleProductChange}>
					{this.props.products.map(item => (
						<option key={item.key} value={item.name} >{item.name}</option>
					))}
				</select>
			</div>
			<div data-field-span="1">
				<label>Variant</label>
				<select value={this.state.variant} onChange={this.handleVariantChange}>
					{this.state.variants.map(item => (
						<option key={item.key} value={item.name} >{item.name}</option>
					))}
				</select>
			</div>
			<div data-field-span="1">
				<label>Quantity</label>
				<input type="text" defaultValue={this.state.quantity} onChange={this.handleQuantityChange} />
			</div>
			<div data-field-span="1">
				<label>Pricing</label>
				<input type="text" defaultValue={this.state.price} onChange={this.handlePriceChange} />
			</div>
			<div data-field-span="1">
				<label>Subtotal</label>
				{this.state.quantity * this.state.price}
			</div>
			<div data-field-span="1">
				<button onClick={this.removeItem}  >Remove Item</button>
			</div>
			
		</div>
	  </div>
    );
  }
}

export default OrderItem;