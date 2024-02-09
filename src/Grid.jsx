import { useState } from "react";

export default function Grid(props) {
  const gridSize = 100; // Defines the size of the grid (10x10)
  const rows = Array.from({ length: gridSize });
  const columns = Array.from({ length: gridSize });

  const [clicks, setClicks] = useState([]);
  const [rectangle, setRectangle] = useState(null);

  const handleClick = (rowIndex, colIndex) => {
    const newClick = { y: rowIndex, x: colIndex };
    setClicks((prevClicks) => {
      const updatedClicks = [...prevClicks, newClick];
      if (updatedClicks.length === 2) {
        // Determine the rectangle bounds
        const minY = Math.min(updatedClicks[0].y, updatedClicks[1].y);
        const maxY = Math.max(updatedClicks[0].y, updatedClicks[1].y);
        const minX = Math.min(updatedClicks[0].x, updatedClicks[1].x);
        const maxX = Math.max(updatedClicks[0].x, updatedClicks[1].x);
        setRectangle({ minY, maxY, minX, maxX });
        return []; // Reset clicks after forming a rectangle
      }
      return updatedClicks;
    });
  };

  const isWithinRectangle = (rowIndex, colIndex) => {
    if (!rectangle) return false;
    return (
      rowIndex >= rectangle.minY &&
      rowIndex <= rectangle.maxY &&
      colIndex >= rectangle.minX &&
      colIndex <= rectangle.maxX
    );
  };

  return (
    <div className="grid grid-cols-100 ">
      {rows.map((_, rowIndex) =>
        columns.map((_, colIndex) => (
          <button
            onClick={() => handleClick(rowIndex, colIndex)}
            key={`${rowIndex}-${colIndex}`}
            className={` btn-small w-full h-full rounded focus:outline-none focus:ring-2 ${
              isWithinRectangle(rowIndex, colIndex)
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
                    }`}
                
          >
           
          </button>
        ))
      )}
    </div>
  );
}
