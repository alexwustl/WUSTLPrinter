import React from "react"
import { compose, withProps } from "recompose"
import {withGoogleMap, GoogleMap} from "react-google-maps"
import withScriptjs from './withScriptjs.jsx'

/*I am using react-google-maps as my API for google maps and am using much of my code straight from their documentation*/
let MyMapComponent;

//https://www.npmjs.com/package/react-async-script-loader

MyMapComponent = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyCfJA0OhSuzE3mLUs-lwFLHKr63a7PE56s&v=3",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)((props) =>
      {
      return(<GoogleMap
        defaultZoom={17}
        defaultCenter={{ lat: 38.6482493, lng: -90.3073722}}
        ref={(map)=>(props.setMap(map))}
        options={{gestureHandling: 'greedy'}}
      >
      {props.markers.filter(function(m){return m.props.visible})}
      </GoogleMap>)}
)

export default MyMapComponent;
