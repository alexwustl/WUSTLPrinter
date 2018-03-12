import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

var register = function(){
  if('serviceWorker' in navigator) {
    window.addEventListener('load',function(){
      navigator.serviceWorker.register('/sw.js').then(function(reg){
      }).catch(function(error){
        console.log('Servicer Worker installation error: '+error);
      });
    });
  }
}

ReactDOM.render( <App />, document.getElementById('root'));

//Disabled due to cors problems with google sheets api
//register();
