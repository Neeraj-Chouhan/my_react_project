
import React, { Component } from 'react';
import './Tbl.css';
import axios from 'axios';
import ReactHTMLTableToExcel from "react-html-table-to-excel";


class ConReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            arr: [],
            daLst: [],
            defaultLeague: '00',
            defaultSeason: '',
            displayLoader: true,
            daData: [],
            defaultReport: '1',
            rptBtnclick: false,
            firstDataLoad: false,
            defaultLeagueName: 'NBA'
            
        }

        this.renderTableHeader = this.renderTableHeader.bind(this);
        this.generateTableData = this.generateTableData.bind(this);
        this.handleReportChange = this.handleReportChange.bind(this);
        this.handleSeasonChange = this.handleSeasonChange.bind(this);
        this.handleLeagueChange = this.handleLeagueChange.bind(this);
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
                    this.setState({ defaultSeason: latest});

                    axios.get(window.$BaseUrl + "RPSRank/GetConsolidatedDAWiseRefRanking?leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
                        .then(res => {
                            const lstLDA = res.data["DAList"].map((da) => { return da["Modified_By_Name"] });
                            const lstDaData = res.data["DAList"];
                            const dataArry = res.data["RankingData"];
                            this.setState({ daLst: lstLDA, daData: lstDaData, arr: dataArry, displayLoader: false });
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

    genReport(e) {

        e.preventDefault();

        this.setState({
            displayLoader: true,
            rptBtnclick: true,
            arr: [],
            firstDataLoad: true
             
        });

        axios.get(window.$BaseUrl + "RPSRank/GetConsolidatedDAWiseRefRanking?leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
            .then(res => {
                const lstLDA = res.data["DAList"].map((da) => { return da["Modified_By_Name"] });
                const lstDaData = res.data["DAList"];
                const dataArry = res.data["RankingData"];
                this.setState({ daLst: lstLDA, daData: lstDaData, arr: dataArry, displayLoader: false });
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
        }

    renderTableHeader() {
        let header = this.state.daData;

        return  header.map((head) => {

            return <th className="add-column"><a href="#" type={this.state.defaultSeason} className="consolidatedLink"
                id={head["Modified_By"]} name={this.state.defaultLeague} 
                onClick={this.props.action}> {head["Modified_By_Name"]}</a></th>

            });
    }

    generateTableData() {


        let daNames = this.state.daLst;
        var tdarr = [];
        let result = [];

        for (var i = 0; i < this.state.arr.length; i++) {

            tdarr = [];

            tdarr.push(<td className="add-column" style={{ textAlign: "left" }}>{this.state.arr[i]["Referee_Name"]}</td>);
            tdarr.push(<td className="add-column">{this.state.arr[i]["Average"]}</td>);

            for (var j = 0; j < daNames.length; j++) {

                if (this.state.arr[i][daNames[j]] == null) {
                    tdarr.push(<td className="add-column">--</td>);

                } else {

                    tdarr.push(<td className="add-column">{this.state.arr[i][daNames[j]]}</td>);
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

        let fileName = "Consolidated_Report_1" + "_" + this.state.defaultLeagueName + "_" + this.state.defaultSeason;
        let sheetName = "Report_1" + "_" + this.state.defaultLeagueName + "_" + this.state.defaultSeason;

           return (

               <div className="App">
                   <div className="row">
                   <div className="panel-body">
                       <h2 className="subheader">Consolidated Report 1</h2>
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
                                <select name="ddlSeason" className="form-control" value={this.state.defaultSeason}
                                    onChange={this.handleSeasonChange}>
                                    {this.props.lstSeason.map((Season) => <option key={Season.SEASON_ID} value={Season.SEASON_NAME}>{Season.SEASON_NAME}</option>)}
                                </select>
                            </div>

                            <div className="col-sm-3">

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
                   {this.state.arr.length > 0 && (this.props.fromIndiReport || this.state.firstDataLoad) ?
                       <div>
                           <div style={{ float: "right", paddingBottom:"5px" }}>
                                <ReactHTMLTableToExcel
                                    id="test-table-xls-button"
                                    className="btn btn-primary"
                                    table="customers"
                                   filename={fileName}
                                   sheet={sheetName}
                                   buttonText="Export to Excel"
                                />
                           </div>
                           
                            <table id="customers">
                                <thead>
                                   <tr>
                                       <th className="add-column" style={{ textAlign: "left" }}>Referee</th>
                                           <th className="add-column">Average</th>
                                       {this.renderTableHeader()}
                                    </tr>
                                </thead>
                                <tbody>
                                   {this.generateTableData()}
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
                                            <th className="add-column">Referee</th>
                                           <th className="add-column">Average</th>
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
                                </table>
                                : null}
                </div>
            );
        
    }
}

export default ConReport;