import React from 'react';
import { ApiResponse } from '../api';

interface DataTableProps {
  data: { inputText: string; response: ApiResponse }[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => (
  <table className="data-table">
    <thead>
      <tr>
        <th>#</th> {/* Serial number header */}
        <th>Input</th>
        <th>Polarity</th>
        <th>Features</th>
        <th>Concerns</th>
        <th>Score</th>
        <th>Change in State</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item, index) => (
        <tr key={index}>
          <td>{index + 1}</td> {/* Serial number cell */}
          <td>{item.inputText}</td>
          <td>{item.response.polarity}</td>
          <td>{item.response.features}</td>
          <td>{item.response.concerns}</td>
          <td>{item.response.score}</td>
          <td>{item.response.changeInState}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default DataTable;
