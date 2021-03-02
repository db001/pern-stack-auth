import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";

import { toast } from "react-toastify";

const PasswordReset = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    email: ""
  });

  const { email } = inputs;

  const onChange = e =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async e => {
    e.preventDefault();
    try {
      const body = { email };
      const response = await fetch(
        "http://localhost:5000/authentication/sendreset/",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      const parseRes = await response.json();

      console.log(parseRes);

      if (parseRes && !parseRes.error) {
        setAuth(false);
        toast.success("Reset email sent");
      } else {
        setAuth(false);
        toast.error(parseRes.error);
      }
    } catch (err) {
      console.error('Reset error: ' + err.message);
    }
  };

  return (
    <Fragment>
      <h1 className="mt-5 text-center">Password Reset</h1>
      <p>Enter your email address here</p>
      <form onSubmit={onSubmitForm}>
        <input
          type="text"
          name="email"
          value={email}
          onChange={e => onChange(e)}
          className="form-control my-3"
        />
        <button className="btn btn-success btn-block">Submit</button>
      </form>
      <Link to="/login">Log In</Link>
    </Fragment>
  );
};

export default PasswordReset;
