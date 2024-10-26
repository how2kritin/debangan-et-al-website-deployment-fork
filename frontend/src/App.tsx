import React, { useState } from 'react';
import './styles.css';
import InputForm from './components/InputForm';
import DataTable from './components/DataTable';
import LineChart from './components/LineChart';
import { fetchApiData, ApiResponse } from './api';

interface TableData {
  inputText: string;
  response: ApiResponse;
}

const App: React.FC = () => {
  const [data, setData] = useState<TableData[]>([]);

  const handleInputSubmit = async (input: string) => {
    try {
      const apiData = await fetchApiData(input);
      setData((prevData) => [...prevData, { inputText: input, response: apiData }]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="app-container">
      <div className="input-section">
        <InputForm onSubmit={handleInputSubmit} />
        <DataTable data={data} />
      </div>
      <div className="chart-section">
        <LineChart data={data.map((item) => item.response)} />
      </div>
    </div>
  );
};

export default App;
