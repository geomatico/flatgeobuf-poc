import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import { geojson } from 'flatgeobuf';
import buffer from '@turf/buffer';
import dissolve from '@turf/dissolve';
import flatten from '@turf/flatten';

import Map from '@geomatico/geocomponents/Map';

import {INITIAL_VIEWPORT} from '../config';

//const FGB_URL = 'https://flatgeobuf.septima.dk/population_areas.fgb';
const FGB_URL = 'https://cdn.geomatico.es/datasets/buildings_Territorial_office_33_Oviedo.fgb';

const MainContent = ({mapStyle}) => {
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [map, setMap] = useState();
  const [bbox, setBbox] = useState();
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState({
    type: 'FeatureCollection',
    features: []
  });

  const sources = useMemo(() => ({
    'fgb': {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    },
    'selected': {
      type: 'geojson',
      data: selectedFeature
    },
  }),
  [features, selectedFeature]);

  const layers = bbox ? [{
    id: 'buildings',
    source: 'fgb',
    type: 'fill',
    paint: {
      'fill-color': '#FABADA',
      'fill-opacity': 0.5,
      'fill-outline-color': '#000000'
    }
  }, {
    id: 'selected',
    source: 'selected',
    type: 'fill',
    paint: {
      'fill-color': '#FABADA',
      'fill-opacity': 1,
      'fill-outline-color': '#000000'
    }
  }] : [];

  const mapChanged = (map) => {
    const bounds = map.getBounds();
    setBbox({
      minX: bounds.getWest(),
      minY: bounds.getSouth(),
      maxX: bounds.getEast(),
      maxY: bounds.getNorth()
    });
  };
  
  useEffect(() => {
    const getFeatures = async () => {
      console.log('Pidiendo geometrías!!!!!');
      const iter = geojson.deserialize(FGB_URL, bbox);
      let features = [];
      for await (let feature of iter) {
        features.push(feature);
      }
      setFeatures(features);
    };
    if (viewport.zoom >= 10) {
      getFeatures();
    }
  }, [bbox]);

  useEffect(() => {
    if (map) {
      map.on('idle', () => {
        mapChanged(map);
      });
    }
  }, [map]);

  const handleMapClick = ({features, lngLat}) => {
    if (features.length){
      const inputFeature = features[0];
      //const buffered = buffer(inputFeature, 5, {units: 'meters'});

      if (selectedFeature.features.length) {
        const featureCollection = {
          ...selectedFeature,
          features: [
            ...flatten(selectedFeature).features,
            ...flatten(inputFeature).features
          ]
        };

        const dissolved = dissolve(featureCollection);
        setSelectedFeature(dissolved);
      } else {
        setSelectedFeature({
          ...selectedFeature,
          features: [inputFeature]
        });
      }

    }
    console.log(lngLat, features);
  };

  return <Map
    onMapSet={setMap}
    mapStyle={mapStyle}
    viewport={viewport}
    sources={sources}
    layers={layers}
    interactiveLayerIds={['buildings']}
    onClick={handleMapClick}
    onViewportChange={setViewport}
    // mapboxAccessToken={process.env.MAPBOX_ACCESS_TOKEN} // Token necesario para ver datos de mapbox o usar mapbox-gl-js v2 (react-map-gl 6)
  />;
};

MainContent.propTypes = {
  mapStyle: PropTypes.string.isRequired
};

export default MainContent;
