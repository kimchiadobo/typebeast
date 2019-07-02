import React from 'react';

import BuyCardColumn from './BuyCardColumn';

export default ({ cars, buyCarFunction }) => {
  const carRows = [];
  let currentRow = [];

  cars.map(car => {
    currentRow.push(car);

    if (currentRow.length === 3) {
      carRows.push(currentRow);
      currentRow = [];
    }
  });

  if (currentRow.length > 0) {
    carRows.push(currentRow);
  }

  const rows = carRows.map(carRow => <BuyCardColumn buyCarFunction={buyCarFunction} cars={carRow} />);

  return <div className="Shop-Carlist-container">{rows}</div>;
};