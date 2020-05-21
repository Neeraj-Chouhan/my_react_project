import React from 'react';
import ReactDOM from 'react-dom';
import Main from './main';

//window.$BaseUrl = 'http://njvdwebext1.nba-hq.com:8001/' //global variable
window.$BaseUrl = 'http://localhost/NBA.RefereePerformance.Web.UI/' 

ReactDOM.render(
    <div>
        
        <Main/>
    </div>,
    document.getElementById('root')
);