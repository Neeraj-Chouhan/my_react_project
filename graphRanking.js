
import React, { Component } from 'react';
import './Tbl.css';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


class GraphReport extends Component {
    constructor(props) {
        super(props);
       
        this.state = {
            arr: {},
            fromDate: new Date(),
            toDate: new Date(),
            defaultOfficial: '-1',
            defaultLeague: '00',
            defaultSeason: '',
            defalutDA: '-1',
            lstReferee: [],
            refereeName: '',
            lstDA: [],
            graphData: [],
            rptBtnclick: false,
            displayLoader:true
        }

        this.showGraphHandler = this.showGraphHandler.bind(this);
        this.onFromDateChange = this.onFromDateChange.bind(this);
        this.onToDateChange = this.onToDateChange.bind(this);
        this.handleRefereeChange = this.handleRefereeChange.bind(this);
        this.handleLeagueChange = this.handleLeagueChange.bind(this);
        this.handleSeasonChange = this.handleSeasonChange.bind(this);
        this.handleDAChange = this.handleDAChange.bind(this);
        this.onImgFromDateClick = this.onImgFromDateClick.bind(this);
        this.onImgToDateClick = this.onImgToDateClick.bind(this);
        this.currReferee = '';
 
    }

    componentDidMount() {

        axios.get(window.$BaseUrl + 'RPSSeason/GetSeasons')
            .then(res => {
                const lstSeason = res.data;
                let updatedsortedSeason = lstSeason.sort((a, b) => b.SEASON_ID - a.SEASON_ID);
                let latest = updatedsortedSeason[0]["SEASON_NAME"];
                this.setState({ defaultSeason: latest });

                axios.get(window.$BaseUrl + "RPSRank/GetRefereeList?leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
                    .then(res => {
                        const lstReferee = res.data["RefereeList"];
                        this.setState({
                            lstReferee
                            , fromDate: new Date(res.data["SeasonStartDate"][0]["startDate"])
                        });
                    })
                    .catch(error => {
                        console.log(error);
                    });

                axios.get(window.$BaseUrl + "RPSUser/GetUsersByGrp?status=1&group_id=4")
                    .then(res => {
                        const lstDA = res.data;
                        this.setState({ lstDA: lstDA, displayLoader: false });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            });
    }

    handleDAChange(e) {

        this.setState({
            defalutDA: e.target.value

        });

    }

    handleSeasonChange(e) {

        this.setState({
            defaultSeason: e.target.value,
            lstReferee: []
        });

        axios.get(window.$BaseUrl + "RPSRank/GetRefereeList?leagueid=" + this.state.defaultLeague + "&seasonid=" + e.target.value)
            .then(res => {
                const lstReferee = res.data["RefereeList"];
                this.setState({ lstReferee });
            })
            .catch(error=>{
                console.log(error);
            });        
    };

    handleLeagueChange(e) {

        this.setState({
            defaultLeague: e.target.value,
            lstReferee:[]
        });

        axios.get(window.$BaseUrl + "RPSRank/GetRefereeList?leagueid=" + e.target.value + "&seasonid=" + this.state.defaultSeason)
            .then(res => {
                const lstReferee = res.data["RefereeList"];
                this.setState({ lstReferee });
            })
            .catch(error=>{
                console.log(error);
            });

    };

    handleRefereeChange(e) {

        var index = e.nativeEvent.target.selectedIndex;

        this.setState({
            refereeName: e.nativeEvent.target[index].text,
            defaultOfficial: e.target.value
        })

    }

    onFromDateChange(date) {

        this.setState({

            fromDate: date
        })
       
    }
    onImgToDateClick() {

        this.selectedToDate.setOpen(true);

    }
    onImgFromDateClick() {
        this.selectedFromDate.setOpen(true);
    }

    onToDateChange(date) {

        this.setState({

            toDate: date
        })

    }

    showGraphHandler(e) {

        e.preventDefault();

        if (this.state.defaultOfficial === '-1') {

            alert('Please select Referee.');
            return;
        }
        if (this.state.defalutDA === '-1') {

            alert('Please select DA.');
            return;
        }

        if (this.state.fromDate == null && this.state.toDate == null) {

            alert('Please select from and to date.');

            return;

        }
        else if (this.state.fromDate == null) {

            alert('Please select from date.');
            return;

        } else if (this.state.toDate == null) {

            alert('Please select to date.');
            return;
        } 
       
        this.setState({
            arr: [],
            graphData: [],
            rptBtnclick: true,
            displayLoader : true

        });

        this.currReferee = this.state.refereeName;

 
        axios.get(window.$BaseUrl + "RPSRank/GetRefereesDetailsForGraph?leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason + "&refId=" + this.state.defaultOfficial + "&frmDate=" + this.state.fromDate.toLocaleDateString() + "&toDate=" + this.state.toDate.toLocaleDateString() + "&DAId=" + this.state.defalutDA)
            .then(res => {
                const lblArray = res.data.map((date) => { return date["Modified_Date"] });
                const dataArray = res.data.map((date) => { return date["Rank_ID"] });
                this.setState({
                    graphData: res.data,
                    arr: {
                        labels: lblArray,
                        datasets: [{
                            label: this.state.refereeName,
                            data: dataArray,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],

                            pointRadius: 10,
                            pointStyle: 'rectRounded',
                            fill: false
                            //steppedLine: true

                        }]


                    },
                    displayLoader: false
                });
            })
            .catch(error => {

                this.setState({
                    displayLoader: false

                });
                console.log(error);
            });


        this.setState({
            rptBtnclick: true
        });

    };
   

    render() {
        return (
            <div className="App">
                <div className="panel-body">
                    <h2 className="subheader">Referee Ranking Chart</h2>
                    </div>
                    <div className="well">
                        <div className="row">

                        <div className="col-sm-2">

                            <label>
                               League</label>
                            <select name="ddlLeague" className="form-control" value={this.state.defaultLeague} onChange={this.handleLeagueChange}>
                                >
                                {this.props.lstLeague.map((League) => <option key={League.League_Code} value={League.stats_leagueid}>{League.Name}</option>)}
                            </select>

                        </div>

                        <div className="col-sm-2">

                            <label>
                               Season</label>
                            <select name="ddlSeason" className="form-control" value={this.state.defaultSeason} onChange={this.handleSeasonChange}>
                                {this.props.lstSeason.map((Season) => <option key={Season.SEASON_ID} value={Season.SEASON_NAME}>{Season.SEASON_NAME}</option>)}
                            </select>

                        </div>

                        <div className="col-sm-2">
                            <label>
                               Referee</label>
                            <select name="ddlOfficial" className="form-control" value={this.state.defaultOfficial} onChange={this.handleRefereeChange} >
                                <option value="-1">--Select Referee--</option>
                                {this.state.lstReferee.map((referee) => <option key={referee.Official_ID} value={referee.Official_ID}>{referee.Referee_Name}</option>)}

                            </select>

                        </div>

                        <div className="col-sm-2">
                            <label>
                                DA</label>
                            <select name="ddlDA" className="form-control" onChange={this.handleDAChange}
                                value={this.state.defaultDA} >
                                <option value="-1">--Select DA--</option>
                                <option value="0">--All DA’s--</option>
                                {this.state.lstDA.map((da) => <option key={da.User_ID} value={da.User_ID}>{da.Last_Name},{da.First_Name}</option>)}
                            </select>

                        </div>

                        <div className="col-sm-2">


                            <label>
                               From Date </label>

                            <div className="input-group input-daterange">
                                <DatePicker selected={this.state.fromDate} className="form-control" onChange={this.onFromDateChange} dateFormat="MM/dd/yyyy" ref={(c) => this.selectedFromDate = c}
                                    peekNextMonth showMonthDropdown showYearDropdown dropdownMode="select"
                                    maxDate={this.state.toDate} />
                                <span className="input-group-addon" onClick={this.onImgFromDateClick}>
                                    <span className="glyphicon glyphicon-calendar"></span>
                                </span>
                              
                            </div>
                        </div>
                        <div className="col-sm-2">


                            <label>
                               To Date </label>

                            <div className="input-group input-daterange">
                               
                                <DatePicker selected={this.state.toDate} className="form-control" onChange={this.onToDateChange} dateFormat="MM/dd/yyyy" ref={(d) => this.selectedToDate = d}
                                    peekNextMonth showMonthDropdown showYearDropdown dropdownMode="select"
                                    minDate={this.state.fromDate} />
                                <span className="input-group-addon" onClick={this.onImgToDateClick}>
                                    <span className="glyphicon glyphicon-calendar"></span>
                                </span>
                            </div>
                        </div>

                    </div>
                   
                    <div className="row">

                        <div className="col-sm-9">

                        </div>

                        <div className="col-sm-3">
                            <button className="btn btn-primary mt25" style={{ marginRight: '10px' }} onClick={this.showGraphHandler}>Generate Graph</button>
                            <button className="btn btn-primary mt25" onClick={this.props.action}>Back to Report</button>

                        </div>
                        </div>
                </div>

                <br />

                {this.state.graphData.length > 0 ?
                    <div className="customer-table-responsive">
                    <table id="customers">
                        <thead>
                                <tr>
                                    <th className="add-column stickyColumn" >{this.currReferee}</th>
                                {this.state.graphData.map((data) => {
                                    return <td className="add-column">{data["Modified_Date"]}</td>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                    <th className="add-column stickyColumn"></th>
                                {this.state.graphData.map((data) => {
                                    return <td className="add-column">{data["Rank_ID"]}
                                    </td>
                                })}

                            </tr>
                        </tbody>
                        </table>
                       </div>
 
                    : this.state.displayLoader ?

                        <div id="UpdateProgress1" role="status" aria-hidden="true">

                            <div className="loading-panel">
                                <div className="loading-container">

                                    <i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>

                        </div>
                        : this.state.rptBtnclick ?
                        <table id="customers">
                        <thead>
                            <tr>
                                <th className="add-column" >{this.currReferee}</th>
                                <td className="add-column" >--</td>


                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th className="add-column stickyColumn" ></th>
                                <td className="add-column" >No records found</td>

                            </tr>
                        </tbody>
                    </table> : null}
                <br />

                {this.state.graphData.length > 0 ?
                    <div style={{height: "400px"}}>
                    <Line
                        data={this.state.arr}
                        options={{
                            maintainAspectRatio: false,
                            legend: {
                                onClick: (e) => e.stopPropagation()
                            },
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        reverse: true,
                                        beginAtZero: true,
                                        min: 1
                    }
                }],
            }
        }}
        />
                        </div>
                    :null
                }

                </div>
                
            );
        
    }
}

export default GraphReport;