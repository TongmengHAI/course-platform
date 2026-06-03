import { useState } from "react";
import { list } from "./data.js";

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  function handleNextClick() {
    setIndex(index + 1);
  }

  function handleMoreClick() {
    setShowMore(!showMore);
  }

  let sculpture = list[index];
  return (
    <>
      <button
        className=" bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleNextClick}
      >
        Next
      </button>
      <h2 className="text-2xl font-bold mt-4 mb-2">
        <i>{sculpture.name} </i>
        by {sculpture.artist}
      </h2>
      <h3 className="text-lg font-semibold mb-4">
        ({index + 1} of {list.length})
      </h3>
      <button
        className=" bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleMoreClick}
      >
        {showMore ? "Hide" : "Show"} details
      </button>
      <p className="text-gray-700 mt-4 mb-4">
        {showMore && <p>{sculpture.description}</p>}
      </p>
      <img src={sculpture.url} alt={sculpture.alt} />
    </>
  );
}
