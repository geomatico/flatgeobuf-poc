import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import { geojson } from 'flatgeobuf';

import Map from '@geomatico/geocomponents/Map';

import {INITIAL_VIEWPORT} from '../config';

const FGB_URL = 'https://cloud.geomatico.es/s/c4eEKzwqL4fFD2N/download/buildings_Territorial_office_33_Oviedo.fgb';

const MainContent = ({mapStyle}) => {
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [map, setMap] = useState();
  const [bbox, setBbox] = useState();

  const sources = useMemo(async () => {

    const iter = geojson.deserialize(FGB_URL, bbox);
    let features = [];
    for await (let feature of iter) {
      features.push(feature);
    }

    return (
      {
        'fgb': {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features
          }
        }
      }
    );
  },
  [bbox]);

  const layers = bbox ? [{
    id: 'buildings',
    source: 'fgb',
    'source-layer': 'SELECT',
    type: 'fill',
    paint: {
      'fill-color': '#FABADA',
      'fill-opacity': 0.5
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
    if (map) {
      map.on('idle', () => {
        mapChanged(map);
      });
    }
  }, [map]);

  return <Map
    onMapSet={setMap}
    mapStyle={mapStyle}
    viewport={viewport}
    sources={sources}
    layers={layers}
    onViewportChange={setViewport}
    // mapboxAccessToken={process.env.MAPBOX_ACCESS_TOKEN} // Token necesario para ver datos de mapbox o usar mapbox-gl-js v2 (react-map-gl 6)
  />;
};

MainContent.propTypes = {
  mapStyle: PropTypes.string.isRequired
};

export default MainContent;
