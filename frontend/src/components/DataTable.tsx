import React from 'react';
import { ApiResponse } from '../api';

interface DataTableProps {
  data: ApiResponse[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => (
  <table className="data-table">
    <thead>
      <tr>
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
          <td>{item.polarity}</td>
          <td>{item.features}</td>
          <td>{item.concerns}</td>
          <td>{item.score}</td>
          <td>{item.changeInState}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default DataTable;
