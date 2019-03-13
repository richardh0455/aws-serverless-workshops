import React from 'react';

class CreateCustomerPopup extends React.Component {
  constructor(props) {
    super(props);
  }
  
  
  render() {
    return (
      <div className='popup'>
        <div className='popup_inner'>
          <h1>{this.props.text}</h1>
        <button >close me</button>
        </div>
      </div>
    );
  }
}

export default CreateCustomerPopup;