/*global google*/
import React, { Component } from 'react';
import './App.css';
import MyMapComponent from './Map.js';
//Pulled from react-google-maps documentation
import {Marker} from 'react-google-maps';

function loadProb(e){
  alert("Google Maps did not load correctly!");
}

class App extends Component {
  map =null
  specialMarker=null
  oldSpecialMarker=null
  yourMarker = null
  state = {
    places: [],
    markers: [],
    updatedMarkers: [],
    showingMenu: false,
    moreInfoText: '',
    query: '',
    toFocus: '',
    doFocus: 'no',
    googleError: false,
    wikiError: false,
    googleLoaded:false,
    specialMarkerPos:null,
    searchButtonText: <i className="material-icons">search</i>,
    specialMarkers:null
  }
  //Sets up the markers by copying them into an updatedMarkers array
  componentDidMount(){
    let newMarks = [];
    let newPlaces = [];
    let _this = this;
    fetch('https://sheets.googleapis.com/v4/spreadsheets/1l3AYFFs-w90-fA8OoIChZFFiA_W-v2Jq12karxjsFQU/values/B5:G300?key=AIzaSyCfJA0OhSuzE3mLUs-lwFLHKr63a7PE56s').then(function(r){
      return r.json();
    }).then(function(r){
      for(var place of r.values){
        let cords = {lat: Number(place[3]),lng: Number(place[4])};
        let title = place[0]+'-'+place[1];
        let description = place[2];
        let link = place[5];
        let mark = <Marker key={title} position={cords} title={title} onClick={_this.doWhenClicked} visible={true}/>
        newMarks.push(mark);
        newPlaces.push({title: title,cords:cords,locationDescription:description,link:link});
      }
    }).then(function(){
      _this.setState({markers:newMarks,updatedMarkers:newMarks,places:newPlaces});
      ////https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
      window.loaded = ()=>{
        _this.setState({googleLoaded:true});
      }
      var script = document.createElement('script');
      script.async = true;
      script.defer= true;
      script.src='https://maps.googleapis.com/maps/api/js?key=AIzaSyCfJA0OhSuzE3mLUs-lwFLHKr63a7PE56s&v=3&callback=loaded';
      script.onerror=loadProb;
      document.body.append(script);
    });
  }
  //https://stackoverflow.com/questions/39174887/focusing-div-elements-with-react
  //https://reactjs.org/docs/refs-and-the-dom.html
  //For how to do the focus
  componentDidUpdate(){
      if(this.state.toFocus==='search'&& this.state.doFocus==='yes'){
        this.setState({doFocus:'no'});
        this.search.focus();
      } else if(this.state.toFocus==='button'&& this.state.doFocus==='yes'){
        this.setState({doFocus:'no'});
        this.button.focus();
      }
  }
  //Gets the wikipedia content
  getWikiContent = (place) =>{
    var _this = this;
    _this.setState({wikiError:false});
    let title = place.title;
    let desc = place.locationDescription;
    if(typeof place.link!=='undefined'){
      console.log(place.link);
      return <div><h2>{title}</h2><p>{desc}</p><a href={place.link}>Check Status Here</a></div>
    } else {
      return <div><h2>{title}</h2><p>{desc}</p></div>
    }

  }
  //Toggles Search menu
  //https://github.com/tomchentw/react-google-maps/issues/305
  //For help with finding map
  toggleSearch = () =>{
    let nextState = !(this.state.showingMenu);
    this.setState({showingMenu: nextState});
    if(nextState){
      //Resets Results
      if(this.oldSpecialMarker!==null){
        this.oldSpecialMarker.setVisible(false);
      }
      if(this.specialMarker!==null){
            this.specialMarker.setVisible(false);
      }
      this.setState({specialMarkerVisible:false})
      this.setState({updatedMarkers:this.state.markers});
      this.setState({toFocus:'search',doFocus:'yes',query:'',specialMarkerPos:null,searchButtonText: <i className="material-icons">exit_to_app</i>,specialMarkers:null});
      if(this.yourMarker!==null){
        this.yourMarker.setVisible(false);
      }
    } else{
      this.setState({updatedMarkers:this.state.markers});
      this.setState({toFocus:'button',doFocus:'yes',query:'',specialMarkerPos:null,searchButtonText: <i className="material-icons">search</i>});
    }
    this.setBounds();
  }
  //Deals with clicks on the marker itself
  doWhenClicked= (marker)=>{
    let place = this.state.places.filter(function(p){
          return (p.cords.lat-marker.latLng.lat())<0.0001&&(p.cords.lat-marker.latLng.lat())>-0.0001&&(marker.latLng.lng()-p.cords.lng)<0.0001&&(marker.latLng.lng()-p.cords.lng)>-0.0001;
    });
    let result =this.getWikiContent(place[0]);
    this.setState({moreInfoText:result});
  };
  //Deals with clicks on the Buttons in the search menu
  doTitleClicked = (title)=>{
    this.toggleSearch();
    let place = this.state.places.filter(function(m){
      return m.title===title;
    })
    let result =this.getWikiContent(place[0]);
    this.setState({moreInfoText:result});
    let mark = this.state.updatedMarkers.filter(function(m){
      return m.props.title===title;
    })
    let u = [mark[0]];
    let notMark = this.state.markers.filter(function(m){
      return !(m.props.title===title);
    })
    this.specialMarker.setVisible(true);
    this.specialMarker.setAnimation(google.maps.Animation.BOUNCE);
    this.specialMarker.setPosition(u[0].props.position);
    this.specialMarker.setTitle(u[0].props.title);
    this.setState({updatedMarkers:notMark,specialMarkerPos:u[0].props.position});
  }

handleSearch = (value) => {
  let updatedMarks = this.state.markers.filter(function(m){
    //Removes case
    return m.props.title.toLowerCase().indexOf(value.toLowerCase())>-1;
  });
  this.setState({query:value,updatedMarkers:updatedMarks,specialMarkers:updatedMarks});
  this.setBounds();
}
//https://github.com/tomchentw/react-google-maps/issues/305
//Finally figured out how to get to map marker to blink
setMap = (map)=>{
    if(map!==null){
    this.map =map.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    let map2 =this.map;
    var marker = new google.maps.Marker({
            map: map2,
            visible: false,
          });
  if(this.specialMarker!==null){
    this.oldSpecialMarker=this.specialMarker;
  }
  this.specialMarker = marker;
  /*https://stackoverflow.com/questions/16331430/resizing-a-google-map-to-fit-a-group-of-markers*/
  /*For setBounds*/
  this.setBounds();
}
}
setBounds() {
  let _this = this;
  if(this.map!==null){
   var bounds = new google.maps.LatLngBounds();
   if(this.state.specialMarkers!=null && this.state.specialMarkerPos==null){
     for (var i=0; i < this.state.specialMarkers.length; i++) {
       if(this.state.specialMarkers[i].props.visible){
         bounds.extend(this.state.specialMarkers[i].props.position);
       }
     }
   } else if(this.state.specialMarkerPos==null){

     for (var j=0; j < this.state.updatedMarkers.length; j++) {
       if(this.state.updatedMarkers[j].props.visible){
         bounds.extend(this.state.updatedMarkers[j].props.position);
       }
     }
   }
   if(this.state.specialMarkerPos!=null){
      bounds.extend(this.state.specialMarkerPos);
   }
     this.map.fitBounds(bounds);
     var listener = google.maps.event.addListener(_this.map, "idle", function() {
         if (_this.map.getZoom() > 19) _this.map.setZoom(19);
         if (_this.map.getZoom() < 15) _this.map.setZoom(15);
         google.maps.event.removeListener(listener);
     });
  }
}
searchNear = ()=>{
  /*https://developers.google.com/maps/documentation/javascript/examples/map-geolocation*/
  if(navigator.geolocation){
    let _this= this;
    navigator.geolocation.getCurrentPosition(function(position){
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      _this.map.panTo(pos);
      _this.map.setZoom(19);
      if(_this.map!==null){
        if(_this.yourMarker===null || typeof _this.yourMarker==='undefined'){
          //Create your location
          var marker = new google.maps.Marker({
                  map: _this.map,
                  visible: true,
                  position: pos,
                  icon: {
                    path: 'M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0',
                    fillColor: '#42e5f4',
                    fillOpacity: 1,
                    scale: 0.1,
                    strokeColor: '#4186f4',
                    strokeWeight: 3
                  }
                });
          _this.yourMarker=marker;
        } else {
          //Repurpose old one
          _this.yourMarker.setPosition(pos);
          _this.yourMarker.setVisible(true);
        }
      }
    });
  }
}
//facebook.github.io/react-native/docs/button.html for buttons
  render() {
    let markerList=[];
    let map =  typeof google!=='undefined'?<div id='googleMap'><MyMapComponent role='application' aria-label="Google Map of Schools"
              markers={this.state.updatedMarkers}
              setMap={this.setMap}
            /></div>:<div><p>Loading Google Maps</p></div>
    if(window.failed||!navigator.onLine){
      map=<div><p>There was an error loading Google Maps, please try again later</p></div>;
    }
    for(let m of this.state.updatedMarkers){
      markerList.push(<button key ={m.props.title} onClick={(event)=>{this.doTitleClicked(event.target.innerHTML)}}>{m.props.title}</button>);
    }

    let wikiText=<h2>Select a Printer for More Information!</h2>;
    if(this.state.wikiError){
      wikiText='An error has occured please try again later';
    }else if(this.state.moreInfoText!==''){
      wikiText=this.state.moreInfoText;
    }
    return (
      <div id='App'>
      {/*https://stackoverflow.com/questions/37728951/how-to-css-displaynone-within-conditional-with-react-jsx for conditional styling*/}
        <nav aria-label="Search Panel" id='search' style={{display: this.state.showingMenu ? 'block':'none'}}>
          <input aria-label="Search Field" ref={(input) => { this.search = input; } } id='searchField' autoFocus type="text" name="Search Bar" placeholder="Search" value={this.state.query}
          onChange = {(event)=>{this.handleSearch(event.target.value)}}/>
          <ul>
          {navigator.onLine ? markerList : <li>Sorry, no connection right now</li>}
          </ul>
        </nav>
        {/*Using Google's Material Icons*/}
        <main id="content">
          <header><button aria-label='Hamburger Menu' id='hamburgerMenu' ref={(input) => { this.button= input; } } onClick={this.toggleSearch}>{this.state.searchButtonText}</button><h1><a href="/">WUSTL Printers</a></h1></header>
          {map}
          <button id='searchNearMe' onClick={this.searchNear}>Search Near You</button>
          <div id='more'>
            {wikiText}
          </div>
          <footer><p>Made by Alex Baker as a project for Washington University in St. Louis</p></footer>
       </main>
       {/*This only loads api Async Credit to react-async-script-loader*/}
      </div>

    );
  }
}



export default App;
