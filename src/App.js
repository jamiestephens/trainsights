import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import { fetchAndStoreTrains } from "./utils";
import Leaflet from "./Leaflet";
import data from "./empirebuilder.json";

export default function App() {
  const storedSelectedItem = localStorage.getItem("selectedItem");
  const [selectedItem, setSelectedItem] = useState(storedSelectedItem || "");
  const [trainNumber, setTrainNumber] = useState("");
  const [trainOptions, setTrainOptions] = useState([]);
  const [trains, setTrains] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [isTrainSelected, setIsTrainSelected] = useState(false);
  const [mapCenter, setMapCenter] = useState([34.74161249883172, 18.6328125]); // Add this line
  const [zoomLevel, setZoomLevel] = useState(5);
  console.log(data);

  const handleDropdownChange = (event) => {
    const value = event.target.value;
    setSelectedItem(value);
    setTrainNumber(""); // Reset the train selection
    setIsTrainSelected(false); // Hide the train sidebar
    localStorage.setItem("selectedItem", value);
  };

  const handleTrainDropdownChange = (event) => {
    const value = event.target.value;
    setTrainNumber(value);
    setIsTrainSelected(value !== "");

    if (selectedItem && trains && typeof trains === "object") {
      const selectedTrains = Object.values(trains)
        .flat()
        .filter((train) => train.routeName === selectedItem);

      if (
        selectedTrains.length > 0 &&
        value >= 1 &&
        value <= selectedTrains.length
      ) {
        const selectedTrain = selectedTrains[value - 1];
        console.log("Latitude:", selectedTrain.lat);
        console.log("Longitude:", selectedTrain.lon);

        setMapCenter([selectedTrain.lat, selectedTrain.lon]);
        setZoomLevel(10); // Adjust the zoom level to your desired value for better visibility
      } else {
        setMapCenter([34.74161249883172, 18.6328125]); // Revert to the original view setting
        setZoomLevel(5);
      }
    }
  };

  useEffect(() => {
    setIsLoading(true); // Set loading state to true
    fetchAndStoreTrains().then((trainsData) => {
      setTrains(trainsData);
      setIsLoading(false); // Set loading state to false once data is fetched
    });
  }, []);

  useEffect(() => {
    if (selectedItem && trains && typeof trains === "object") {
      const selectedTrains = Object.values(trains)
        .flat()
        .filter((train) => train.routeName === selectedItem);
      const trainOptions = selectedTrains.map((train, index) => (
        <option key={train.trainID} value={index + 1}>
          {`${train.destName} ${train.objectID}`}
        </option>
      ));
      setTrainNumber("");
      setTrainOptions(trainOptions);
    }
  }, [selectedItem, trains]);

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-content">
          <ul>
            <li>Select a Route</li>
          </ul>
          <select value={selectedItem} onChange={handleDropdownChange}>
            {!selectedItem && <option value="">Select an item</option>}
            <option value="Acela">Acela</option>
            <option value="Adirondack">Adirondack</option>
            <option value="Empire Builder">Empire Builder</option>
          </select>
          {selectedItem && (
            <div>
              <ul>
                <li>Select a Train</li>
              </ul>
              <select value={trainNumber} onChange={handleTrainDropdownChange}>
                <option value="">Select a train</option>
                {trainOptions}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="main-content">
        <header className="app-header">
          <h1>TrackVista: Amtrak Journey Navigator</h1>
        </header>

        {isTrainSelected ? (
          <div className="train-details">
            <div className="train-map">
              {" "}
              {/* Adjusted CSS classes */}
              <Leaflet
                selectedItem={selectedItem}
                handleDropdownChange={handleDropdownChange}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>

            <div className="train-sidebar">
              <div className="train-cards-container">
                {isTrainSelected && (
                  <div className="train-cards">
                    {[...Array(10)].map((_, index) => (
                      <div key={index} className="train-card"></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="full-map">
            {" "}
            {/* CSS class for full-width map */}
            <Leaflet
              selectedItem={selectedItem}
              handleDropdownChange={handleDropdownChange}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
