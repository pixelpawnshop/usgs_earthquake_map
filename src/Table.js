import React, { useState } from 'react';

const Table = ({ earthquakes, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(earthquakes.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentItems = earthquakes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Magnitude</th>
            <th>Time</th>
            <th>Title</th>
            <th>Lat</th>
            <th>Lon</th>
            <th>Depth</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((eq, index) => (
              <tr key={index} onClick={() => onRowClick(eq)}>
                <td>{eq.magnitude}</td>
                <td>{formatDate(eq.time)}</td>
                <td>{eq.title}</td>
                <td>{eq.lat.toFixed(2)}</td>
                <td>{eq.long.toFixed(2)}</td>
                <td>{eq.depth.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          First
        </button>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
          Last
        </button>
      </div>
    </div>
  );
};

export default Table;
