"use client"
import React, { useState } from 'react';

const Tokenization = () => {
  const [form, setForm] = useState({
    assetName: '',
    description: '',
    assetValue: '',
    tokenAmount: '',
    proofDocument: null,
    tokenizationType: 'multiple' // Tipo por defecto
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, proofDocument: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se llamará a la función para procesar la tokenización
  };

  return (
    <div>
      <h1>Tokenize Your Asset</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="assetName"
          placeholder="Asset Name"
          value={form.assetName}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Asset Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          type="number"
          name="assetValue"
          placeholder="Asset Value"
          value={form.assetValue}
          onChange={handleChange}
        />
        
        <select
          name="tokenizationType"
          value={form.tokenizationType}
          onChange={handleChange}
        >
          <option value="multiple">Multiple Tokens</option>
          <option value="single">Single Token (For Collateral)</option>
        </select>

        {form.tokenizationType === 'multiple' && (
          <input
            type="number"
            name="tokenAmount"
            placeholder="Number of Tokens"
            value={form.tokenAmount}
            onChange={handleChange}
          />
        )}
        
        <input
          type="file"
          name="proofDocument"
          onChange={handleFileChange}
        />
        <button type="submit">Tokenize Asset</button>
      </form>
    </div>
  );
};

export default Tokenization;
