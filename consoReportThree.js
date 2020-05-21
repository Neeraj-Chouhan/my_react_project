
import React, { Component } from 'react';
import './Tbl.css';
import axios from 'axios';
import ReactHTMLTableToExcel from "react-html-table-to-excel";


class ConReportThree extends Component {

    constructor(props) {
        super(props);

        this.state = {

            defaultLeague: '00',
            defaultSeason: '',
            defaultReport: '3',
            defalutDA: '-1',
            lstDate: [],
            arr: [],
            defaultOfficial: '-1',
            displayLoader: true,
            lstReferee: [],
            lstDA: [],
            LatestRankByDA : [],
            rptBtnclick: false,
            defaultLeagueName: 'NBA'
        }

        this.handleReportChange = this.handleReportChange.bind(this);
      
        this.handleLeagueChange = this.handleLeagueChange.bind(this);
        this.handleSeasonChange = this.handleSeasonChange.bind(this);
        this.handleRefereeChange = this.handleRefereeChange.bind(this);
        this.genReport = this.genReport.bind(this);
        this._isMounted = false;

    }

    componentDidMount() {

        this._isMounted = true;

        axios.get(window.$BaseUrl + 'RPSSeason/GetSeasons')
            .then(res => {

                if (this._isMounted) {

                    const lstSeason = res.data;
                    let updatedsortedSeason = lstSeason.sort((a, b) => b.SEASON_ID - a.SEASON_ID);
                    let latest = updatedsortedSeason[0]["SEASON_NAME"];
                    this.setState({ defaultSeason: latest });

                    axios.get(window.$BaseUrl + "RPSRank/GetRefereeList?leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
                        .then(res => {
                            const lstReferee = res.data["RefereeList"];
                            this.setState({ lstReferee, displayLoader: false });
                        })
                        .catch(error => {
                            this.setState({ displayLoader: false });
                            console.log(error);
                        });
                }
            });

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleRefereeChange(e) {

        this.setState({
          
            defaultOfficial: e.target.value
        })

    }

    genReport(e) {

        e.preventDefault();

        if (this.state.defaultOfficial === '-1') {

            alert('Please select Referee.');
            return;
        }

        this.setState({
            displayLoader: true,
            arr: [],
            LatestRankByDA: [],
            rptBtnclick:true

        });

        axios.get(window.$BaseUrl + "RPSRank/GetConsolidatedDAWiseForReferee?leagueId=" + this.state.defaultLeague + "&seasonId=" + this.state.defaultSeason + "&officialId=" + this.state.defaultOfficial)
            .then(res => {
                console.log(res.data);
                const LatestRankByDA = res.data["LatestRankByDA"];
                const dataArry = res.data["DAWisePivot"];
                this.setState({ LatestRankByDA: LatestRankByDA, arr: dataArry, displayLoader: false });
            })
            .catch(error => {
                this.setState({ displayLoader: false });
                console.log(error);
            });

        
    };

    handleSeasonChange(e) {

        this.setState({
            defaultSeason: e.target.value

        });
    };

    handleLeagueChange(e) {

        this.setState({
            defaultLeague: e.target.value,
            defaultLeagueName: e.target.selectedOptions[0].text
        });

    };

    renderTableHeader() {

        let header = this.state.LatestRankByDA;

        return header.map((head) => {

            return <th className="add-column">{head["DA_Name"]}</th>;

        });
    }

    generateTableData() {

        let daData = this.state.LatestRankByDA;
        var tdarr = [];
        let result = [];

        for (var i = 0; i < this.state.arr.length; i++) {

            tdarr = [];

            tdarr.push(<td className="add-column">{this.state.arr[i]["Rank_ID"]}</td>);
           
            for (var j = 0; j < daData.length; j++) {

                if (this.state.arr[i]["Rank_ID"] == daData[j]["Rank_ID"]) {

                    tdarr.push(<td className="add-column">{this.state.arr[i]["Referee_Name"]}</td>);

                } else {

                    tdarr.push(<td className="add-column"></td>);
                } 
            }

            result.push(<tr>{tdarr}</tr>)
        }

        return result;
       
    }

    handleReportChange(e) {


        this.props.consoReportTwoClick(e.target.value);
    }

    render() {

        let fileName = "Consolidated_Report_3" + "_" + this.state.defaultLeagueName + "_" + this.state.defaultSeason;
        let sheetName = "Report_3" + "_" + this.state.defaultLeagueName + "_" + this.state.defaultSeason;

        return (

            <div className="App">
                <div className="row">
                <div className="panel-body">
                    <h2 className="subheader">Consolidated Report 3</h2>
                    </div>
                    <div className="col-sm-10">
                        <div className="well">
                           
                            <div className="row">

                        <div className="col-sm-3">

                                    <label>
                                        Report</label>
                                    <select name="ddlReportType" className="form-control" onChange={this.handleReportChange}
                                        value={this.state.defaultReport} >
                                        <option value="1">Report Type 1</option>
                                        <option value="2">Report Type 2</option>
                                        <option value="3">Report Type 3</option>
                                    </select>

                                </div>

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

                        <div className="col-sm-3">

                            <label>
                                Referee</label>
                            <select name="ddlOfficial" className="form-control" value={this.state.defaultOfficial} onChange={this.handleRefereeChange} >
                                <option value="-1">--Select Referee--</option>
                                {this.state.lstReferee.map((referee) => <option key={referee.Official_ID} value={referee.Official_ID}>{referee.Referee_Name}</option>)}

                            </select>

                        </div>

                        <div className="col-sm-2">

                         <button className="btn btn-primary mt25" style={{ marginRight: '10px' }} onClick={this.genReport} >Generate Report</button>
                       
                        </div>
                    </div>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <div className="well">
                           
                            <div className="row">
                                <div className="col-sm-12">
                                    <label>
                                        Graph</label>
                                    <button className="btn btn-primary" onClick={this.props.graphAction}>Graph Ranking</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.state.arr.length > 0 ?
                    <div>
                        <div style={{ float: "right", paddingBottom: "5px" }}>
                            <ReactHTMLTableToExcel
                                id="test-table-xls-button"
                                className="btn btn-primary"
                                table="customers"
                                filename={fileName}
                                sheet={sheetName}
                                buttonText="Export to Excel"
                            />
                        </div>
                        <div className="customer-table-responsive">
                            <table id="customers">
                                <thead>
                                    <tr>
                                        <th className="add-column">Rank</th>
                                        {this.renderTableHeader()}
                                       
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.generateTableData()}
                                </tbody>
                            </table>
                        </div>
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
                                        <th className="add-column">Rank</th>
                                        <th className="add-column">Referee</th>
                                        <th className="add-column">-</th>
                                        <th className="add-column">-</th>
                                        <th className="add-column">-</th>
                                        <th className="add-column">-</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={5}>No records found</td>
                                    </tr>


                                </tbody>
                            </table> : null}
            </div>

        )

    }
}

export default ConReportThree;