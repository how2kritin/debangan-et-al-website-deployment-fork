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
  if (score < 0.75) return "Moderate";
  return "Severe";
}


function getSleepQualityLabel(score: number): string {
  if (score < 0.25) return "Poor";
  if (score < 0.50) return "Moderate";
  if (score < 0.75) return "Good";
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

const LoadingModal = () => {
  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

interface MentalHealthTips {
  anxiety: string[];
  depression: string[];
  insomnia: string[];
  schizophrenia: string[];
  adhd: string[];
}

interface Suggestion {
  category: string;
  tip: string;
}

interface SuggestionsProps {
  data: TableData[];
}

const Suggestions: React.FC<SuggestionsProps> = ({ data }) => {
  const mental_health_tips: MentalHealthTips = {
    anxiety: [
      "It sounds like you're feeling a bit on edge; taking a few slow, deep breaths might help bring some calm.",
      "Feeling anxious can be tough—remember, it's okay to take things one small step at a time.",
      "If you're feeling overwhelmed, grounding exercises like focusing on your surroundings can be really soothing."
    ],
    depression: [
      "You don't have to go through this alone; talking to someone you trust could help lighten the load.",
      "Small achievements matter. Even a tiny task completed is a step forward, so give yourself credit.",
      "Remember, it's okay to take breaks and just rest—healing is a journey, and you're allowed to go at your own pace."
    ],
    insomnia: [
      "Looks like you're having trouble sleeping—try listening to some lofi tunes before bed to help you relax.",
      "A warm cup of herbal tea could set the mood for rest; sometimes small routines make a big difference.",
      "If you're lying awake, maybe try some gentle stretches or reading to help ease your mind before sleep."
    ],
    schizophrenia: [
      "Remember, you are more than any challenges you face. Staying connected to trusted support can make a big difference.",
      "Taking time to relax, even in small ways like listening to calming music, could help you feel grounded.",
      "Keeping a journal of your thoughts might help you understand your feelings better and track positive moments."
    ],
    adhd: [
      "If staying focused is a challenge, using a timer for short, focused bursts can make tasks feel more manageable.",
      "Taking regular, short breaks can help reset your mind and keep things from overwhelming.",
      "Keeping a to-do list might help organize your thoughts—ticking things off as you go can be really satisfying."
    ]
  };

  const getRandomTip = (tips: string[]): string => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  };

  if (data.length === 0) return <></>;

  const latest_entry_categories = data[data.length - 1].response.categories;
  if (latest_entry_categories.length === 0) return <></>;

  const suggestions: Suggestion[] = latest_entry_categories.map((category: string) => {
    const tips = mental_health_tips[category as keyof MentalHealthTips];
    return {
      category,
      tip: tips ? getRandomTip(tips) : ''
    };
  }).filter(suggestion => suggestion.tip !== '');

  return (
    <div className="suggestions-container">
      <h2>Helpful Suggestions</h2>
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-card">
            <h3>{suggestion.category}</h3>
            <p>{suggestion.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<TableData[]>([]);
  const [datesRecords, setDatesRecords] = useState<Map<string, CategoryOnADateInfo[]>>(new Map());
  const [sampleDate, setSampleDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [polarities, setPolarities] = useState<number[]>([]);

  const handleInputSubmit = async (input: string) => {
    try {
      const apiData = await fetchApiData(input, setIsLoading);
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

      let polarity = -1;
      if (apiData.polarity === "positive") polarity = +1;
      else if (apiData.polarity === "negative") polarity = -1;
      else polarity = 0;

      setPolarities(() =>
        [
          ...polarities,
          polarity
        ]
      );

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

  const polarityPlot: Plot = {
    category: "Polarity",
    items: polarities.map((value) => ({
      score: value,
      label: "",
    })),
  };


  return (
    <div className="app-container">
      {isLoading && <LoadingModal />}

      <div className="input-section">
        <InputForm onSubmit={handleInputSubmit} />
      </div>

      <div className="plots-container">
        <div className="plot">
          <LineChart
            dates={dates}
            plots={firstPlots}
            title="Scores for All Categories Over Time"
            yLabel="Category Scores"
          />
        </div>
        <div className="plot">
          <LineChart
            dates={dates}
            plots={sleepQuality}
            title="Sleep Quality"
            yLabel="Score"
          />
        </div>
        <div className="plot">
          <LineChart
            dates={dates}
            plots={[polarityPlot]}
            title="Polarities"
            yLabel="Polarity Value"
          />
        </div>
      </div>

    <div className="data-table-container">
      <DataTable data={data} />
    </div>

      <Suggestions data={data}/>
  </div>
);
}

export default App;
