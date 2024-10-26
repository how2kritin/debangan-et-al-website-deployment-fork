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

export interface PlotItem {
  score: number;
  label: string;
}

export interface Plot {
  category: string;
  items: PlotItem[];
}

interface CategoryOnADateInfo {
  category: string;
  score: number;
  label: string;
}

function getCurrentDateRecords(apiData: ApiResponse) : CategoryOnADateInfo[] {
  let names = apiData.categoryNames;
  let scores = apiData.categoryScores;
  let labels = apiData.categoryLabels;
  
  let dateRecords: CategoryOnADateInfo[] = [];
  for (let i = 0; i < names.length; i++) {
    let record: CategoryOnADateInfo = {
      category: names[i],
      score: scores[i],
      label: labels[i],
    }
    
    dateRecords.push(record);
  }
  
  return dateRecords;
}


function getPlots(sample_date: string, datesRecords: Map<string, CategoryOnADateInfo[]>): Plot[] {
  const numPlots: number = datesRecords.get(sample_date)?.length;
  let plots: Plot[] = [];
  
  for (let i = 0; i < numPlots; i++) {
    let category = "";
    let items: PlotItem[] = [];
    for (const [_date, categories] of datesRecords.entries()) {
      category = categories[i].category;
      items.push({
        score: categories[i].score,
        label: categories[i].label,
      });
    }
  }

  return plots;
}


const App: React.FC = () => {
  const [data, setData] = useState<TableData[]>([]);
  const [datesRecords, setDatesRecords] = useState<Map<string, CategoryOnADateInfo[]>>(new Map());
  const [sampleDate, setSampleDate] = useState<string>("");

  const handleInputSubmit = async (input: string) => {
    try {
      const apiData = await fetchApiData(input);
      setData((prevData) => [...prevData, { inputText: input, response: apiData }]);
      
      let curDate: string = apiData.currentDate;
      setSampleDate(() => curDate);
      let curDateRecords = getCurrentDateRecords(apiData);
      setDatesRecords(() => new Map([
        ...Array.from(datesRecords.entries()),
        [curDate, curDateRecords]
      ]));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  let dates = Array.from(datesRecords.keys());
  let plots = getPlots(sampleDate, datesRecords);
  

  return (
    <div className="app-container">
      <div className="input-section">
        <InputForm onSubmit={handleInputSubmit} />
        <DataTable data={data} />
      </div>
      <div className="chart-section">
        <LineChart
          data={data.map((item) => item.response)}
          dates={dates}
          plots={plots}
        />
      </div>
    </div>
  );
};

export default App;
