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

function getCurrentDateRecords(apiData: ApiResponse): CategoryOnADateInfo[] {
  const names = apiData.categoryNames;
  const scores = apiData.categoryScores;
  const labels = apiData.categoryLabels;
  
  const dateRecords: CategoryOnADateInfo[] = [];
  for (let i = 0; i < names?.length; i++) {
    const record: CategoryOnADateInfo = {
      category: names[i],
      score: scores[i],
      label: labels[i],
    }
    
    dateRecords.push(record);
  }
  
  return dateRecords;
}


function getPlots(sample_date: string, datesRecords: Map<string, CategoryOnADateInfo[]>): Plot[] {
  if (!datesRecords.get(sample_date)) {
    return [];
  }

  const numPlots: number = datesRecords.get(sample_date)?.length || 0;
  const plots: Plot[] = [];

  // console.log(numPlots);
  
  // Create a plot for each category
  for (let i = 0; i < numPlots; i++) {
    const plot: Plot = {
      category: "",
      items: []
    };

    // console.log(datesRecords.entries())
    
    // For each date, get the score and label for this category index
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_date, categories] of datesRecords.entries()) {
      plot.category = categories[i].category;
      
      plot.items.push({
        score: categories[i].score,
        label: categories[i].label,
      });
    }
    
    plots.push(plot);
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
      // console.log(input);
      
      const curDate: string = apiData.currentDate;
      setSampleDate(() => curDate);
      
      const curDateRecords = getCurrentDateRecords(apiData);
      // console.log(curDateRecords)
      setDatesRecords(new Map([
        ...datesRecords,
        [curDate, curDateRecords]
      ]));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const dates = Array.from(datesRecords.keys()).slice(-7);
  // console.log(sampleDate)
  const plots = getPlots(sampleDate, datesRecords).map((plot) => ({
    ...plot,
    items: plot.items.slice(-7),
  }))

  return (
    <div className="app-container">
      <div className="input-section">
        <InputForm onSubmit={handleInputSubmit} />
        <DataTable data={data} />
      </div>
      <div className="chart-section">
        <LineChart
          dates={dates}
          plots={plots}
        />
      </div>
    </div>
  );
};

export default App;
