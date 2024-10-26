import axios from 'axios';

export interface ApiResponse {
  polarity: string;
  features: string[];
  concerns: string[];
  score: number;
  changeInState: number;
  currentDate: string;
  categoryNames: string[];
  categoryScores: number[];
  categoryLabels: string[];
}

export async function fetchApiData(input: string): Promise<ApiResponse> {
  const response = await axios.post<ApiResponse>('http://127.0.0.1:5000/api/process', { input });
  return response.data;
}
