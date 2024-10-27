import axios from 'axios';

export interface ApiResponse {
  polarity: string;
  features: string[];
  categories: string[];
  intensity: number[];
  changeInState: number;
  currentDate: string;
  categoryNames: string[];
  categoryScores: number[];
  categoryLabels: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export async function fetchApiData(input: string, isLoading: Function): Promise<ApiResponse> {
  isLoading(true);
  const response = await axios.post<ApiResponse>('http://127.0.0.1:5000/api/process', { input });
  isLoading(false);
  return response.data;
}
