import axios from 'axios';

export interface ApiResponse {
  polarity: string;
  features: string;
  concerns: string;
  score: number;
  changeInState: number;
}

export async function fetchApiData(input: string): Promise<ApiResponse> {
  const response = await axios.post<ApiResponse>('YOUR_API_ENDPOINT', { input });
  return response.data;
}
