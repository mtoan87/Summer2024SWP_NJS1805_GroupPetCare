import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../../config/axios';
import './update-jewelry.scss';
import { EditOutlined } from '@ant-design/icons';

function StaffViewJewelryDetails() {
  const [jewelryDetails, setJewelryDetails] = useState({
    accountId: '',
    imageUrl: '',
    name: '',
    materials: '',
    description: '',
    category: '',
    weight: '',
    weightUnit: 'grams',
    goldAge: '',
    purity: '',
    price: '',
    collection: '',
    jewelryImg: '',
    shipment: ''
  });
  const [errors, setErrors] = useState({});
  const { id, material } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJewelryDetails = async () => {
      try {
        const response = await api.get(`/api/Jewelry${material === 'Gold' ? 'Gold' : 'Silver'}/GetById/${id}`);
        setJewelryDetails({
          ...response.data
        });
      } catch (error) {
        console.error('Error fetching jewelry details:', error);
      }
    };

    fetchJewelryDetails();
  }, [id, material]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJewelryDetails(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdateJewelry = async () => {
    const newErrors = {};
    if (jewelryDetails.materials === 'silver' && !jewelryDetails.purity) {
      newErrors.purity = 'Purity is required for silver jewelry';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const formData = new FormData();
    formData.append('AccountId', jewelryDetails.accountId);
    formData.append('Name', jewelryDetails.name);
    formData.append('Materials', jewelryDetails.materials);
    formData.append('Description', jewelryDetails.description);
    formData.append('Category', jewelryDetails.category);
    formData.append('Weight', jewelryDetails.weight);
    formData.append('Price', jewelryDetails.price);
    formData.append('WeightUnit', jewelryDetails.weightUnit);
    formData.append('jewelryImg', jewelryDetails.jewelryImg);
    formData.append('Shipment', jewelryDetails.shipment);
    if (material === 'Gold') {
      formData.append('GoldAge', jewelryDetails.goldAge);
    } else {
      formData.append('Purity', jewelryDetails.purity);
    }

    try {
      const endpoint = material === 'Gold'
        ? `/api/JewelryGold/UpdateJewelryGoldStaff?id=${id}`
        : `/api/JewelrySilver/UpdateJewelrySilverStaff?id=${id}`;
      await api.put(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/', { state: { successMessage: 'Jewelry updated successfully!' } });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="jewel-content">
        <h1>My Jewelry</h1>
      </div>
      <div className="jewelry-details-container">
        <div className="jewelry-details-item">
          <label htmlFor="image">Image</label>
          <div className="upload-label-details">
            <img className='item-img'
              // src={`https://localhost:44361/${jewelryDetails.jewelryImg}`}
              alt={jewelryDetails.name}
              onError={(e) => { e.target.src = "src/assets/img/jewelry_introduction.jpg"; }}
            />
          </div>

          <label htmlFor="name">Name</label>
          <input type="text" name="name" value={jewelryDetails.name} disabled />

          <label htmlFor="materials">Materials</label>
          <input type="text" name="materials" value={jewelryDetails.materials} disabled />

          <label htmlFor="category">Category</label>
          <input type="text" name="category" value={jewelryDetails.category} disabled />

          {jewelryDetails.materials === 'Gold' && (
            <>
              <label htmlFor="goldAge">Gold Age</label>
              <input type="text" name="goldAge" value={jewelryDetails.goldAge} disabled />
            </>
          )}

          {jewelryDetails.materials === 'silver' && (
            <>
              <label htmlFor="purity">Purity</label>
              <input type="text" name="purity" value={jewelryDetails.purity} onChange={handleInputChange} />
              {errors.purity && <span className="error">{errors.purity}</span>}
            </>
          )}

          <label htmlFor="price">Price</label>
          <div className="input-container">
            <input type="text" name="price" value={jewelryDetails.price} onChange={handleInputChange} />
          </div>
          {errors.price && <span className="error">{errors.price}</span>}

          <label htmlFor="shipment">Shipment</label>
          <input type="text" name="shipment" value={jewelryDetails.shipment} onChange={handleInputChange} />

          <button onClick={handleUpdateJewelry}><EditOutlined/> Update</button>
        </div>
      </div>
    </div>
  );
}

export default StaffViewJewelryDetails;
