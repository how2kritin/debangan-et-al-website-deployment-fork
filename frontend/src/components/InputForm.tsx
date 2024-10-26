import React, { useState } from 'react';

interface InputFormProps {
  onSubmit: (input: string) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    onSubmit(input);
    setInput('');
  };

  return (
    <div className="input-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter data"
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default InputForm;
