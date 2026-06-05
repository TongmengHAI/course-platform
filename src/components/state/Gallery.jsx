import { useState } from "react";
import { list } from "./data.js";

export default function Gallery() {
  const [page, setPage] = useState(0);
  const [person, setPerson] = useState({
    name: "",
    age: 10,
    sex: "male",
    address: {
      city: "",
      country: "Cambodia",
    },
  });

  function updatePersonName(event) {
    // console.log(person);
    // console.log(event.target.value)

    // person.name = event.target.value;
    // setPerson(person.name = event.target.value);

    // spread operator
    setPerson({
      ...person,
      name: event.target.value,
    });

    console.log(person);
  }
  function updatePersonAge(event) {
    // spread operator
    setPerson({
      ...person,
      age: event.target.value,
    });

    console.log(person);
  }

  // const [person, setPerson] = useState({
  //   name: "",
  //   age: 10,
  //   sex: "male",
  //   address: {
  //     city: "",
  //     country: "Cambodia",
  //   },
  // });

  function updatePersonAddr(event) {
    // spread operator
    // setPerson({
    //   ...person,
    //   age: event.target.value,
    // });

    setPerson({
      ...person,
      address: {
        ...person.address,
        city: event.target.value,
      }
    });

    console.log(person);
  }

  // Immer


  function handleNextClick() {
    console.log(list.length);

    // page = 12 list.length = 12 -1 = 11
    if (page < list.length - 1) {
      setPage(page + 1);
    } else {
      setPage(0);
    }

    // if (page === list.length - 1) setPage(0);

    // ternary operator
    // page < list.length - 1 ? setPage(page + 1) : setPage(0);
  }

  let sculpture = list[page];
  return (
    <>
      <div className="mb-4">
        <label> Name</label>
        <input type="text" onKeyUp={updatePersonName}></input>
      </div>
      <div className="mb-4">
        <label> Age</label>
        <input type="text" onKeyUp={updatePersonAge}></input>
      </div>

      <div className="mb-4">
        <label> Sex</label>
        <input
          type="text"
          onKeyUp={(event) => {
            setPerson({
              ...person,
              sex: event.target.value,
            });

          }}
        ></input>
      </div>
      <div className="mb-4">
        <label> City</label>
        <input type="text" onKeyUp={updatePersonAddr}></input>
      </div>

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
        ({page + 1} of {list.length})
      </h3>
      <img src={sculpture.url} alt={sculpture.alt} />
    </>
  );
}
