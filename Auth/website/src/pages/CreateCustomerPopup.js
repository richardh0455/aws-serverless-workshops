import React from 'react';

class CreateCustomerPopup extends React.Component {
  constructor(props) {
    super(props);
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

            <div data-field-span="1">
				<label>First Name</label>
				<input type="text" defaultValue="First Name"  />
			</div>
			<div data-field-span="1">
				<label>Last Name</label>
				<input type="text" defaultValue="Last Name" />
			</div>
			<div data-field-span="1">
				<label>Billing Address</label>
				<input type="text" defaultValue="Billing Address"  />
			</div>
			<div data-field-span="1">
				<label>Region</label>
				<select value="NZ" onChange={}>
                  <option key='1' value="NZ">Select a Region</option>
                  <option key='2' value="SA">SA</option>
                  <option key='3' value="NA">NA</option>
                  <option key='4' value="EU">EU</option>
                  <option key='5' value="AP">AP</option>
                  <option key='6' value="ME">ME</option>
                  
                </select>
			</div>

            </div>
        </fieldset>
        </form>
      </section>
	  
	  
      </div>
    );
  }
}

export default CreateCustomerPopup;