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

const maxScores = {
  "depression": 27,
  "anxiety": 21,
  "adhd": 18,
  "schizophrenia": 21,
  "insomnia": 18,
  "sleepQuality": 100,
};


function getLabel(score: number): string {
  if (score < 0.25) return "None";
  if (score < 0.50) return "Mild";
  if (score < 0.75) return"Moderate";
  return "Severe";
}


function getSleepQualityLabel(score: number): string {
  if (score < 0.25) return "Poor";
  if (score < 0.50) return "Moderate";
  if (score < 0.75) return"Good";
  return "Excellent";
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
    items: plot.items.slice(-7).map((value) => ({
      ...value,
      label: getLabel(value.score)
    }))
  }));

  const firstPlots = plots.filter((plot) => {
    return plot.category !== "insomnia";
  });

  const sleepQuality = plots.filter((plot) => {
    return plot.category === "insomnia";
  }).map((plot) => ({
    category: "Sleep Quality",
    items: plot.items.map((value) => ({
      score: 100 * (1 - value.score / maxScores.insomnia),
      label: getSleepQualityLabel(100 * (1 - value.score / maxScores.insomnia))
    }))
  }));

  return (
    <div className="app-container">
      <div className="input-section">
            <InputForm onSubmit={handleInputSubmit} />
      </div>
      <div className="plots-container">
        <div className="plot">
          <LineChart dates={dates} plots={firstPlots} title="Scores for All Categories Over Time" yLabel='Category Scores'/>
        </div>
        <div className="plot">
          <LineChart dates={dates} plots={sleepQuality} title="Sleep Quality" yLabel='Score'/>
        </div>
      </div>

      <div className="data-table-container">
        <DataTable data={data} />
      </div>
    </div>
  );
};

export default App;
