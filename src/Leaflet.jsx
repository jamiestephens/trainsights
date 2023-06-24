import React, { useEffect, useRef, useState } from "react";
import { Map, TileLayer, Pane, CircleMarker } from "react-leaflet";
import { fetchAllTrains } from "amtrak";
import "leaflet/dist/leaflet.css";
import zipUrl from "./Amtrak_Routes.zip";
import Shapefile from "./Shapefile";

function Leaflet({ selectedItem, handleDropdownChange, isLoading }) {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [trainMarkers, setTrainMarkers] = useState([]);
  const [mapCenter, setMapCenter] = useState([37.0902, -95.7129]);
  const [zoomLevel, setZoomLevel] = useState(5);

  useEffect(() => {
    const leafletMap = mapRef.current?.leafletElement;

    if (leafletMap) {
      setMap(leafletMap);
    }
  }, []);

  useEffect(() => {
    if (map && selectedItem) {
      fetchAllTrains().then((trains) => {
        setTrainMarkers([]);
        console.log(trains);
        const selectedTrains = Object.values(trains)
          .flat()
          .filter((train) => train.routeName === selectedItem);

        const markers = selectedTrains.map((train) => (
          <CircleMarker
            key={train.trainID}
            center={[train.lat, train.lon]}
            radius={5}
            color="blue"
            fillColor="blue"
            fillOpacity={1}
          />
        ));

        setTrainMarkers(markers);

        if (selectedTrains.length > 0) {
          const selectedTrain = selectedTrains[0]; // Select the first train
          const { lat, lon } = selectedTrain;
          setMapCenter([lat, lon]); // Update map center
          setZoomLevel(10); // Update zoom level
        }
      });
    }
  }, [map, selectedItem]);

  useEffect(() => {
    if (!selectedItem) {
      setMapCenter([37.0902, -95.7129]); // Set default map center when no item is selected
      setZoomLevel(5); // Set default zoom level when no item is selected
    }
  }, [selectedItem]);

  return (
    <div style={{ height: "100vh" }}>
      {isLoading && (
        <div className="leaflet-loading-overlay">
          <div className="leaflet-loading-text">Loading...</div>
        </div>
      )}
      <Map
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {selectedItem && (
          <Shapefile zipUrl={zipUrl} itemName={selectedItem} map={map} />
        )}
        <Pane name="markerPane" style={{ zIndex: 500 }}>
          {trainMarkers}
        </Pane>
      </Map>
    </div>
  );
}

export default Leaflet;
