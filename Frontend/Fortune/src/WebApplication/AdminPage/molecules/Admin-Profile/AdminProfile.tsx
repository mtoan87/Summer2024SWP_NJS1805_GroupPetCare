import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, EditOutlined } from '@ant-design/icons';
import api from "../../../../config/axios";
import { useUser } from "../../../Data/UserContext"; 
import Alert from 'react-bootstrap/Alert';
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import './ProfileAdmin.scss';  

const ProfileAdmin: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user, setUser } = useUser();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      const response = await api.put("api/Account/updateAccount", {
        name,
        email,
        password,
        phone
      });
      const data = response.data;
      setUser(data);  // Update user context
      sessionStorage.setItem("loginedUser", JSON.stringify(data));
      setSuccessMessage("Account updated successfully!");
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update account. Try again!");
    }
  };

  return (
    <>
      <div className="Profile-page-Manager">
      <div className="profile-admin">
      <div className="loaded-message">
        {successMessage && (
          <Alert key={'success'} variant={'success'} className="alert-success">
            {successMessage}
          </Alert>
        )}
        <h1>INFORMATION</h1>
      </div>
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          <UserOutlined /> Name
        </label>
        <input
          type="text"
          id="name"
          className="form-control"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          <MailOutlined /> Email
        </label>
        <input
          type="email"
          id="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled // Email shouldn't be changed
        />
      </div>
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          <LockOutlined /> Password
        </label>
        <input
          type="password"
          id="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          <PhoneOutlined /> Phone
        </label>
        <input
          type="text"
          id="phone"
          className="form-control"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="bt">
        <button type="button" className="btn btn-primary" onClick={handleUpdate}>
          <EditOutlined /> Update Account
        </button>
      </div>
    </div>
    </div>
    </>
  );
};

export default ProfileAdmin;
