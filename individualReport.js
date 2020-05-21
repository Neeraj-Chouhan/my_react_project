
import React, { Component } from 'react';
import './Tbl.css';
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import axios from 'axios';

class IndReport extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            arr: [],
            lstLeague: [],
            data: [],
            tblData: [],
            displayLoader: true,
            defaultLeague: '00',
            defaultSeason: '',
            ExcelData: [],
            defaultLeagueName:'NBA'
        }

        this.handleSeasonChange = this.handleSeasonChange.bind(this);
        this.handleLeagueChange = this.handleLeagueChange.bind(this);
        this.customTrimmedString = this.customTrimmedString.bind(this);
        this.getDataForExport = this.getDataForExport.bind(this);
        this.genReport = this.genReport.bind(this);
        this._isMounted = false;


        if (this.props.DaId === 0) {
            this.currentUser = document.getElementById('ReactContent_HiddenDAId').value;
        } else {
            this.currentUser = this.props.DaId;
        }
       
    }

    componentDidMount() {  

        this._isMounted = true;

        if (this.props.DaId == 0) {

            axios.get(window.$BaseUrl + 'RPSSeason/GetSeasons')
                .then(res => {
                    if (this._isMounted) {
                        const lstSeason = res.data;
                        let updatedsortedSeason = lstSeason.sort((a, b) => b.SEASON_ID - a.SEASON_ID);
                        let latest = updatedsortedSeason[0]["SEASON_NAME"];
                        this.setState({ defaultSeason: latest });

                        axios.get(window.$BaseUrl + 'RPSRank/GetLatestRankingOfAllRefsByDA?daId='
                            + parseInt(this.currentUser)+ '&gameId=0&leagueid=' + this.state.defaultLeague + '&seasonid=' + this.state.defaultSeason)
                            .then(res => {

                                const data = res.data;
                                this.setState({ tblData: data });

                            })
                            .catch(error => {
                                
                                console.log(error);
                            });
                        //get data for Excel
                        axios.get(window.$BaseUrl + 'RPSRank/GetIndividualRankingExport?daId='
                            + parseInt(this.currentUser) + '&leagueid=' + this.state.defaultLeague + '&seasonid=' + this.state.defaultSeason)
                            .then(res => {

                                const data = res.data;
                                this.setState({ ExcelData: data, displayLoader: false });

                            })
                            .catch(error => {
                                this.setState({ displayLoader: false });
                                console.log(error);
                            });

                    }
                });
        } else {

           

                axios.get(window.$BaseUrl + 'RPSRank/GetLatestRankingOfAllRefsByDA?daId='
                    + parseInt(this.props.DaId) + '&gameId=0&leagueid=' + this.props.newLeague + '&seasonid=' + this.props.newSeason)
                    .then(res => {
                        if (this._isMounted) {

                            const data = res.data;
                            this.setState({ tblData: data });
                        }

                    })
                    .catch(error => {
                       
                        console.log(error);
                    });
                //get data for Excel
                axios.get(window.$BaseUrl + 'RPSRank/GetIndividualRankingExport?daId='
                    + parseInt(this.props.DaId) + '&leagueid=' + this.props.newLeague + '&seasonid=' + this.props.newSeason)
                    .then(res => {

                        if (this._isMounted) {

                            const data = res.data;
                            this.setState({ ExcelData: data, displayLoader: false });
                        }

                    })
                    .catch(error => {
                        this.setState({ displayLoader: false });
                        console.log(error);
                    });
            }
       
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    genReport(e) {

        e.preventDefault();

        this.setState({
            displayLoader: true,
            tblData: [],
            ExcelData: []
        });

        axios.get(window.$BaseUrl + 'RPSRank/GetLatestRankingOfAllRefsByDA?daId='
            + parseInt(this.currentUser) + '&gameId=0&leagueid=' + this.state.defaultLeague + '&seasonid=' + this.state.defaultSeason)
            .then(res => {
                const lstLeague = res.data;
                this.setState({ tblData: lstLeague, displayLoader: false });
            })
            .catch(error => {
                this.setState({ displayLoader: false });
                console.log(error);
            });

        //get data for Excel
        this.getDataForExport(e);
    };

    getDataForExport(e) {
        //get data for Excel
        axios.get(window.$BaseUrl + 'RPSRank/GetIndividualRankingExport?daId='
            + parseInt(this.currentUser) + '&leagueid=' + this.state.defaultLeague + '&seasonid=' + this.state.defaultSeason)
            .then(res => {

                const data = res.data;
                this.setState({ ExcelData: data });

            })
            .catch(error => {
                console.log(error);
            });
    }

    handleSeasonChange(e) {
        this.setState({
            defaultSeason: e.target.value,
            ExcelData:[]
        },function () {
                this.getDataForExport();
        });
    };

    handleLeagueChange(e) {
        this.setState({
            defaultLeague: e.target.value,
            defaultLeagueName: e.target.selectedOptions[0].text,
            ExcelData: []
        }, function () {
            this.getDataForExport();
        });
    };
    customTrimmedString(string, length) {
          if (string !== undefined && string !== null) {
            return string.length > length ? string.substring(0, length) + "..." : string;
        } else {
            return string;
        }
    }


    render() {
        let fileName = "IndividualReport" + "_" + this.state.defaultLeagueName + "_" + this.state.defaultSeason;
        return (
            <div className="App">
                <div className="row">
                <div className="panel-body">
                    <h2 className="subheader">Individual Report</h2>
                    </div>
                    {document.getElementById('ReactContent_HiddenRole').value != "Admin" ?
                        <div>
                <div className="col-sm-9">
                    <div className="well">
                       
                        
                            <div className="row">
                                
                                <div className="col-sm-3">
                                    <label>
                                        League</label>
                                    <select name="ddlLeague" className="form-control" value={this.state.defaultLeague} onChange={this.handleLeagueChange}>
                                        >
                                {this.props.lstLeague.map((League) => <option key={League.League_Code} value={League.stats_leagueid}>{League.Name}</option>)}
                                    </select>

                                </div>

                                <div className="col-sm-3">

                                    <label>
                                        Season</label>
                                    <select name="ddlSeason" className="form-control" value={this.state.defaultSeason} onChange={this.handleSeasonChange}>
                                        {this.props.lstSeason.map((Season) => <option key={Season.SEASON_ID} value={Season.SEASON_NAME}>{Season.SEASON_NAME}</option>)}
                                    </select>
                                </div>

                                <div className="col-sm-4">
                                    <button className="btn btn-primary mt25" style={{ marginRight: '10px' }} onClick={this.genReport} >Generate Report</button>                                  


                                </div>

                            </div> 
                    </div>
                    </div>
                    
                <div className="col-sm-3">
                            <div className="well">
                                <div className="row">
                                        <div className="col-sm-12">
                                            <label>
                                                Evaluate</label>
                                            <br/>
                      <button type="submit" className="btn btn-primary" onClick={this.props.action}>Evaluate Ranking</button>
                                    </div>
                                </div>
                            </div>
                        </div> </div>: 
                            <div className="col-sm-12">
                                <div className="well">
                                    <div className="row">
                                        <div className="col-sm-12">
                                        <button type="submit" className="btn btn-primary mt25"
                                            onClick={this.props.backButtonClick}>Back to List</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                </div>

                {this.state.tblData.length > 0 ?
                    <div>
                        <div style={{ float: "right", paddingBottom: "5px"}}>
                <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="btn btn-primary"
                    table="ExcelTable"
                    filename={fileName}
                    sheet={fileName}
                    buttonText="Export to Excel" />
                                                 
                </div>

                    <table id="customers">
                        <thead>
                            <tr key="4">
                               
                                    <th className="add-column">Rank</th>
                                    <th className="add-column" style={{ textAlign: "left" }}>Referee</th>
                                    <th className="add-column">Last Reviewed On</th>
                                    <th className="add-column">Review Comments</th>
                                   
                               
                            </tr>
                        </thead>
                    <tbody>
                       
                       
                        {this.state.tblData.map((eachStep, index) => {
                            return <tr key={eachStep.Rank_Id}>
                                       
                                <td className="add-column">{eachStep.Rank_ID}</td>
                                <td className="add-column" style={{ textAlign: "left" }}>{eachStep.Referee_Name}</td>
                                <td className="add-column">{eachStep.Last_Reviewed_Date}</td>
                                <td className="add-column comments-wrapper"  style={{ textAlign: "left" }}><span title={eachStep.Review_Comments}>{this.customTrimmedString(eachStep.Review_Comments, 100)}</span></td>     
                                        </tr>})
                                }
                               
                               
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

                        </div> : <table id="customers">
                            <thead>
                                <tr>
                                    <th className="add-column">Rank</th>
                                    <th className="add-column">Referee</th>
                                    <th className="add-column">Last Reviewed On</th>
                                    <th className="add-column">Review Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td colSpan={4}>No records found</td>
                            </tr>
                         

                            </tbody>
                        </table>}


                <table id="ExcelTable" className="hide">
                    <thead>
                        <tr>

                            
                            <th className="add-column">Referee</th>
                            <th className="add-column">Official ID</th>
                            <th className="add-column">Previous</th>
                            <th className="add-column">New</th>
                            <th className="add-column">Change</th>
                            <th className="add-column">Game Date</th>
                            <th className="add-column">Game </th>
                            <th className="add-column">GameID</th>


                        </tr>
                    </thead>
                    <tbody>


                        {this.state.ExcelData.map((eachStep, index) => {
                            return <tr key={eachStep.Rank_Id}>
                                <td className="add-column">{eachStep.Referee_Name}</td>
                                <td className="add-column">{eachStep.Official_ID}</td>
                                <td className="add-column">{eachStep.Previous_Rank_ID}</td>
                                <td className="add-column">{eachStep.Current_Rank_ID}</td>
                                
                                <td className="add-column">{eachStep.ChangeInRank}</td>
                                <td className="add-column">{eachStep.Game_Date}</td>
                                <td className="add-column">{eachStep.Game}</td>
                                <td className="add-column">{eachStep.Game_ID != null ? JSON.stringify(eachStep.Game_ID) : ''}</td>
                            </tr>
                        })
                        }


                    </tbody>
                </table>
                </div>
            );
        } 
    }

export default IndReport;
