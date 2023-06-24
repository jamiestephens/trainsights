import React, { useEffect, useState } from "react";
import L from "leaflet";
import shp from "shpjs";

function Shapefile({ zipUrl, itemName, map }) {
  const [shapefileLayers, setShapefileLayers] = useState([]);

  useEffect(() => {
    const fetchAndAddShapefile = async () => {
      try {
        const response = await fetch(zipUrl);
        const shapefileData = await response.arrayBuffer();
        const shapefileFeatures = await shp(shapefileData).catch((error) => {
          console.error("Error loading shapefile:", error);
        });

        // Remove existing shapefile layers from the map
        shapefileLayers.forEach((layer) => {
          map.removeLayer(layer);
        });

        if (shapefileFeatures) {
          const filteredFeatures = shapefileFeatures.features.filter(
            (feature) =>
              feature.properties && feature.properties.NAME === itemName
          );

          const newShapefileLayers = filteredFeatures.map((feature) => {
            return L.geoJSON(feature, {
              onEachFeature: function popUp(f, l) {
                var out = [];
                if (f.properties) {
                  for (var key in f.properties) {
                    out.push(key + ": " + f.properties[key]);
                  }
                  l.bindPopup(out.join("<br />"));
                }
              }
            });
          });

          // Add the new shapefile layers to the map
          newShapefileLayers.forEach((layer) => {
            layer.addTo(map);
          });

          // Update the shapefile layers state
          setShapefileLayers(newShapefileLayers);
        }
      } catch (error) {
        console.error("Error loading shapefile:", error);
      }
    };

    if (itemName) {
      fetchAndAddShapefile();
    } else {
      // If no item is selected, remove all shapefile layers from the map
      shapefileLayers.forEach((layer) => {
        map.removeLayer(layer);
      });
      setShapefileLayers([]);
    }
  }, [zipUrl, itemName, map, shapefileLayers]);

  return null;
}

export default Shapefile;
