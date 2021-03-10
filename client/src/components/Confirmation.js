import React, { Component } from 'react';

class Confirmation extends Component {
    constructor(props) {
        super(props);
    }
  
    async getProfile() {
      try {
        const res = await fetch("http://localhost:5000/confirm/", {
          method: "PUT",
        });
  
        const parseData = await res.json();

        console.log(parseData);
  
      } catch (err) {
        console.error(err.message);
      }
    };

    componentDidMount() {
        this.getProfile();
    }    
  
    render() {
        return (
        <div>
            <div className="d-flex mt-5 justify-content-around">
            <h2>Thanks for confirming</h2>
            </div>
        </div>
        );
    }
}

export default Confirmation;