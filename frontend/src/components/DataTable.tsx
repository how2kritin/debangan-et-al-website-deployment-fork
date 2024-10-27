import React from 'react';
import { ApiResponse } from '../api';

interface DataTableProps {
  data: { inputText: string; response: ApiResponse }[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => (
  <table className="data-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Input</th>
        <th>Polarity</th>
        <th>Features</th>
        <th colSpan={2}>Categories</th>
        <th>Change in State</th>
      </tr>
      <tr>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th>Category</th>
        <th>Intensity</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {data.map((item, index) => (
        <React.Fragment key={index}>
          <tr>
            <td rowSpan={item.response.categories.length}>{index + 1}</td>
            <td rowSpan={item.response.categories.length}>{item.inputText}</td>
            <td rowSpan={item.response.categories.length}>{item.response.polarity}</td>
            <td rowSpan={item.response.categories.length}>{item.response.features.join(', ')}</td>
            <td>{item.response.categories[0]}</td>
            <td>{item.response.intensity[0]}</td>
            <td rowSpan={item.response.categories.length}>{item.response.changeInState}</td>
          </tr>
          {item.response.categories.slice(1).map((category, catIndex) => (
            <tr key={`${index}-${catIndex}`}>
              <td>{category}</td>
              <td>{item.response.intensity[catIndex + 1]}</td>
            </tr>
          ))}
        </React.Fragment>
      ))}
    </tbody>
  </table>
);

export default DataTable;
