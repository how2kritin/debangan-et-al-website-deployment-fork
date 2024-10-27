import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      // minHeight="100vh"
      gap={2} // spacing between input and button
    >
      <TextField
        label="Enter data"
        variant="outlined"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        sx={{ width: '300px' }} // adjust the width as needed
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
};

export default InputForm;
