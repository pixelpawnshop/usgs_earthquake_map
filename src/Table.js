import React, { useState } from 'react';
import './style.css'; // Assuming you create a separate CSS file for styling

const Table = ({ earthquakes, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const itemsPerPage = 10;

  const sortedEarthquakes = React.useMemo(() => {
    let sortableEarthquakes = [...earthquakes];
    if (sortConfig.key) {
      sortableEarthquakes.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableEarthquakes;
  }, [earthquakes, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(sortedEarthquakes.length / itemsPerPage);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentItems = sortedEarthquakes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th className="sortable" onClick={() => handleSort('magnitude')}>
              Mag {sortConfig.key === 'magnitude' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th>Time</th>
            <th>Title</th>
            <th>Lat</th>
            <th>Lon</th>
            <th className="sortable" onClick={() => handleSort('depth')}>
              Depth in km {sortConfig.key === 'depth' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((eq, index) => (
              <tr key={index} onClick={() => onRowClick(eq)}>
                <td>{eq.magnitude}</td>
                <td>{new Date(eq.time).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                  timeZoneName: 'short'
                })}</td>
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
