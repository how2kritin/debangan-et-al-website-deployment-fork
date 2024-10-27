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
  const response = await axios.post<ApiResponse>('https://debangan-et-al-megathon-2k24-production.up.railway.app:8080/api/process', { input });
  isLoading(false);
  return response.data;
}
