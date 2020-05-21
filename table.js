
import React, { Component } from 'react';
import './Tbl.css';
import axios from 'axios';
import "react-datepicker/dist/react-datepicker.css";
import up from './up.png';
import down from './down.png';


class Table extends Component {

   
    constructor(props) {
        super(props);
        this.moveStep = this.moveStep.bind(this);
        this.state = {
            arr: [],
            lstLeague: [],
            lstGame: [],
            startDate: new Date(),
            GameDate: "",
            EvalData: [],
            ExistingData:[],
            defaultLeague: '00',
            defaultGame: '-1',
            defaultSeason: '',
            SelectedGame: '',
            txtCommentsval: '',
            ShowLoader: true,
            lastIndex: 0,
            IsLeague: '',
            _isMounted: true,
            btnResetDisabled: true,
            btnUpdateDisabled: true
        }

        
        this.handletxtCommentChange = this.handletxtCommentChange.bind(this);
        this.handleLeagueChange = this.handleLeagueChange.bind(this);
        this.handleGameChange = this.handleGameChange.bind(this);
        this.handleUpdateButton = this.handleUpdateButton.bind(this);
        this.handleResetButton = this.handleResetButton.bind(this);
        this.currentUser = document.getElementById('ReactContent_HiddenDAId').value;
       
    }

    componentDidMount() {

        axios.get(window.$BaseUrl + "RPSLeague/GetLeague")
            .then(res => {
                if (this.state._isMounted) {
                    const lstLeague = res.data;
                    this.setState({ lstLeague });

                axios.get(window.$BaseUrl + "RPSRank/GetDAPastAssignedGames?leagueId=" + this.state.defaultLeague + "&DAId=" + this.currentUser)
                    .then(res => {
                        const lstGame = res.data;
                        this.setState({ lstGame });


                        axios.get(window.$BaseUrl + 'RPSSeason/GetSeasons')
                            .then(res => {

                                const lstSeason = res.data;
                                let updatedsortedSeason = lstSeason.sort((a, b) => b.SEASON_ID - a.SEASON_ID);
                                let latest = updatedsortedSeason[0]["SEASON_NAME"];
                                this.setState({ defaultSeason: latest });

                                axios.get(window.$BaseUrl + "RPSRank/GetLatestRankingOfAllRefsByDA?daId=" + document.getElementById('ReactContent_HiddenDAId').value + "&gameId=" + this.state.defaultGame + "&leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
                                    .then(res => {

                                        const EvalData = res.data;
                                        this.setState({
                                            EvalData,
                                            lastIndex: EvalData.length,
                                            ShowLoader: false
                                        });

                                    }).catch(error => {
                                        this.setState({ ShowLoader: false });
                                        console.log(error);
                                    });

                                axios.get(window.$BaseUrl + "RPSRank/GetLatestRankingOfAllRefsByDA?daId=" + document.getElementById('ReactContent_HiddenDAId').value + "&gameId=" + this.state.defaultGame + "&leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
                                    .then(res => {
                                        if (this.state._isMounted) {

                                            const ExistingData = [...res.data];
                                            this.setState({ ExistingData });
                                        }
                                    }).catch(error => { console.log(error); });

                            }).catch(error => {
                                console.log(error);
                            });

                    }).catch(error => {
                        console.log(error);
                    });
            }
            }).catch(error => {
                console.log(error);
            });
       



    }

    componentWillUnmount() {

        this.setState({
            _isMounted: false
        });
       
    }
    
    handleUpdateButton(e) {

        e.preventDefault();

        if (confirm("Do you wish to update the ranking?")) {

            this.reportButton.focus();

            this.setState({

                ShowLoader: true

            });


            let Commentvalue = '';

            if (document.getElementById('ReactContent_HiddenRole').value != "League") {

                if (this.state.txtCommentsval.length > 0) {
                    Commentvalue = this.state.txtCommentsval + "\n"+"Rank affected while adjusting the game : " + this.state.SelectedGame;
                } else {

                    Commentvalue = "Rank affected while adjusting the game : " + this.state.SelectedGame;
                }
            } else {

                Commentvalue = this.state.txtCommentsval;
            }

            let Game_date = '';

            if (this.state.SelectedGame!='') {
                Game_date = this.state.SelectedGame.split('-')[0];
               
            }

            let members = this.state.EvalData.map((member) => {

                return (
                    Object.assign(member, {
                        ["Review_Comments"]: Commentvalue, ["League_Id"]: this.state.defaultLeague,
                        ["CREATED_BY"]: document.getElementById('ReactContent_HiddenDAId').value,
                        ["Game_id"]: this.state.defaultGame,
                        ["Game_date"]: Game_date
                    })

                )
            });


            function comparer(otherArray) {
                return function (current) {
                    return otherArray.filter(function (other) {
                        return other.Rank_ID == current.Rank_ID && other.Referee_Name == current.Referee_Name
                    }).length == 0;
                }
            }

            var changedRows = this.state.EvalData.filter(comparer(this.state.ExistingData));


            let members1 = changedRows.map((member) => {

                return (
                    Object.assign(member, {
                        ["Review_Comments"]: Commentvalue, ["League_Id"]: this.state.defaultLeague,
                        ["CREATED_BY"]: document.getElementById('ReactContent_HiddenDAId').value,
                        ["Game_id"]: this.state.defaultGame,
                        ["Game_date"]: Game_date
                    })


                )
            });
 
          
            const RPSRefRank = {};

            RPSRefRank.refRankFull = this.state.EvalData
            RPSRefRank.refRankUpdate = changedRows;

            const header = {
                'Content-Type': 'application/json;charset=UTF-8'
            }

            axios.post(window.$BaseUrl + "RPSRank/UpdInsRefRanks", RPSRefRank, { headers: header })
                .then(res => {
                    console.log(res);
                    alert('Records Updated Successfully');
                    this.setState({
                        txtCommentsval: '',
                        btnResetDisabled: true,
                        btnUpdateDisabled: true,
                        EvalData: [],
                        ExistingData:[]

                    });

                    axios.get(window.$BaseUrl + "RPSRank/GetLatestRankingOfAllRefsByDA?daId=" + document.getElementById('ReactContent_HiddenDAId').value + "&gameId=" + this.state.defaultGame + "&leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
                        .then(res => {
                            if (this.state._isMounted) {
                                const EvalData = res.data;
                                this.setState({
                                    EvalData,
                                    lastIndex: EvalData.length,
                                    ShowLoader: false
                                });
                            }

                            axios.get(window.$BaseUrl + "RPSRank/GetLatestRankingOfAllRefsByDA?daId=" + document.getElementById('ReactContent_HiddenDAId').value + "&gameId=" + this.state.defaultGame + "&leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
                                .then(res => {
                                    if (this.state._isMounted) {
                                        const ExistingData = [...res.data];
                                        this.setState({
                                            ExistingData
                                        });
                                    }
                                })
                        })
                        .catch(error=>{
                            console.log(error);
                        });                
                })
                .catch(error=>{
                    console.log(error);
                });

        } else {

            return;
        }

    };

    handletxtCommentChange(e) {
        if (e.target.value.length < 1001) {
            this.setState({
                txtCommentsval: e.target.value
            });
        }

    };

    handleResetButton(e) {

        e.preventDefault();

        if (confirm("Do you wish to reset the ranking?")) {

            this.setState({
                EvalData: [],
                ExistingData: [],
                ShowLoader: true,
                btnResetDisabled: true,
                btnUpdateDisabled: true,
                txtCommentsval:''
            });

            this.reportButton.focus();

            axios.get(window.$BaseUrl + "RPSRank/GetLatestRankingOfAllRefsByDA?daId=" + document.getElementById('ReactContent_HiddenDAId').value + "&gameId=" + this.state.defaultGame + "&leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
                .then(res => {
                    const EvalData = res.data;
                    this.setState({ EvalData, ShowLoader: false });
                })
                .catch(error => {
                    console.log(error);
                    this.setState({ ShowLoader: false });
                });

            axios.get(window.$BaseUrl + "RPSRank/GetLatestRankingOfAllRefsByDA?daId=" + document.getElementById('ReactContent_HiddenDAId').value + "&gameId=" + this.state.defaultGame + "&leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
                .then(res => {
                    if (this.state._isMounted) {
                        const ExistingData = [...res.data];
                        this.setState({
                            ExistingData
                        });
                    }
                }).catch(error => {
                    console.log(error);
                }); 
        }

    };

    handleGameChange(e) {

        this.setState({
            ShowLoader: true,
            btnResetDisabled: true,
            btnUpdateDisabled: true
        });

        this.setState({
            EvalData: []
        });

        var index = e.nativeEvent.target.selectedIndex;

       
        this.setState({
            SelectedGame: e.nativeEvent.target[index].text
        });
       
        this.setState({
            defaultGame: e.target.value
        });

        axios.get(window.$BaseUrl + "RPSRank/GetLatestRankingOfAllRefsByDA?daId=" + document.getElementById('ReactContent_HiddenDAId').value + "&gameId=" + e.target.value +"&leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
            .then(res => {
                this.setState({ EvalData: res.data, lastIndex: res.data.length, ShowLoader : false });
            })
            .catch(error=>{
                this.setState({ ShowLoader : false });
                console.log(error);
            });

        axios.get(window.$BaseUrl + "RPSRank/GetLatestRankingOfAllRefsByDA?daId=" + document.getElementById('ReactContent_HiddenDAId').value + "&gameId=" + e.target.value +"&leagueid=" + this.state.defaultLeague + "&seasonid=" + this.state.defaultSeason)
            .then(res => {
                this.setState({ ExistingData : [...res.data] });
            })
            .catch(error=>{
                console.log(error);
            });
    
    };

    handleLeagueChange(e) {

        this.setState({
            EvalData: [],
            ExistingData: [],
            defaultLeague: e.target.value,
            lstGame: [],
            defaultGame: '-1',
            ShowLoader: true
        });

        axios.get(window.$BaseUrl + "RPSRank/GetDAPastAssignedGames?leagueId=" + e.target.value + "&DAId=" + this.currentUser)
            .then(res => {

                if (this.state._isMounted) {
                    const lstGame = res.data;
                    this.setState({ lstGame });
                }
            }).catch(error => {
               
                console.log(error);
            });

       
        axios.get(window.$BaseUrl + "RPSRank/GetLatestRankingOfAllRefsByDA?daId=" + document.getElementById('ReactContent_HiddenDAId').value + "&gameId=-1&leagueid=" + e.target.value + "&seasonid=" + this.state.defaultSeason)
            .then(res => {
                this.setState({ EvalData: res.data, lastIndex: res.data.length, ShowLoader : false });
            })
            .catch(error=>{
                this.setState({ ShowLoader : false });
                console.log(error);
            });

        axios.get(window.$BaseUrl + "RPSRank/GetLatestRankingOfAllRefsByDA?daId=" + document.getElementById('ReactContent_HiddenDAId').value + "&gameId=-1&leagueid=" + e.target.value + "&seasonid=" + this.state.defaultSeason)
            .then(res => {
                if (this.state._isMounted) {
                    const ExistingData = [...res.data];
                    this.setState({
                        ExistingData
                    });
                }
            }).catch(error=> {
                    console.log(error);
             });           

    };

    moveStep(e, stepNo, direction, officialId) {

        e.preventDefault();

        let currentIndex = Number(stepNo) - 1;
        let newIndex = currentIndex - 1;
        if (direction === "down") {
            newIndex = currentIndex + 1;
        }

        if (newIndex < 0 ) {
            return;
        }
        if (newIndex == this.state.lastIndex) {
            return;
        }

        this.setState({ btnResetDisabled: false, btnUpdateDisabled: false });

        let movedArr = this.arrayMove(this.state.EvalData, currentIndex, newIndex, officialId, direction);

        this.state.EvalData =
            this.setState({
                EvalData: movedArr
            });
       
        
    }

    arrayMove(EvalData, old_index, new_index, officialId, direction) {

        const ExistingRankObj = this.state.ExistingData.filter(function (item) {
            return item.Official_ID == officialId;
        });

        const CurrentRankObj = this.state.EvalData.filter(function (item) {
            return item.Official_ID == officialId;
        });

        if (document.getElementById('ReactContent_HiddenRole').value != "League") {

            if (direction === "down") {

                if (CurrentRankObj[0].Rank_ID >= Number(ExistingRankObj[0].Rank_ID) + 2) {

                    alert('Rank can be increased or decreased for two position only! ');

                    return EvalData;
                }

            } else {
               
                if (CurrentRankObj[0].Rank_ID <= Number(ExistingRankObj[0].Rank_ID) - 2) {

                    alert('Rank can be increased or decreased for two position only! ');

                    return EvalData;
                }

            }

          

        }

       


        while (old_index < 0) {
            old_index += EvalData.length;
        }
        while (new_index < 0) {
            new_index += EvalData.length;
        }
        if (new_index >= EvalData.length) {

            var k = new_index - EvalData.length + 1;
            while (k--) {
                EvalData.push(undefined);
            }
        }

        let newRank = EvalData[new_index]["Rank_ID"];
        let oldRank = EvalData[old_index]["Rank_ID"];

        EvalData.splice(new_index, 0, EvalData.splice(old_index, 1)[0]);

        EvalData[new_index]["Rank_ID"] = newRank;
        EvalData[old_index]["Rank_ID"] = oldRank;

        EvalData[new_index].CREATED_BY = document.getElementById('ReactContent_HiddenDAId').value;
        EvalData[old_index].CREATED_BY = document.getElementById('ReactContent_HiddenDAId').value;

        EvalData[new_index].League_Id = this.state.defaultLeague;
        EvalData[old_index].League_Id = this.state.defaultLeague;

        function comparer(otherArray) {
            return function (current) {
                return otherArray.filter(function (other) {
                    return other.Rank_ID == current.Rank_ID && other.Referee_Name == current.Referee_Name
                }).length == 0;
            }
        }

        var changedRows = this.state.EvalData.filter(comparer(this.state.ExistingData));

        if (changedRows.length <= 0) {
            this.setState({
                btnResetDisabled: true,
                btnUpdateDisabled: true

            });
        }
        return EvalData;
        
    }

    render() {

        return (

            <div className="App">
                <div className="panel-body">
                    <h2 className="subheader">Rank Evaluation</h2>
                    </div>
                    <div className="well">
                        <div className="row">
                            {this.state.lstLeague.length > 0 ?
                                <div className="col-sm-2">
                                    <label>
                                      League</label>
                                    <select name="ddlLeague" className="form-control" value={this.state.defaultLeague}
                                        onChange={this.handleLeagueChange}>
                                        {this.state.lstLeague.map((League) => <option key={League.League_Code} value={League.stats_leagueid}>{League.Name}</option>)}
                                    </select>

                                </div>
                                : <div className="col-sm-2">
                                    <label>
                                       League</label>
                                    <select name="ddlLeague" className="form-control" value={this.state.defaultLeague}
                                        onChange={this.handleLeagueChange}>
                                        <option key="-1" value="-1">Select League</option>
                                    </select>

                            </div>}

                        {document.getElementById('ReactContent_HiddenRole').value != "League" ? 
                        <div>
                            {this.state.lstGame.length > 0 ?
                                    <div className="col-sm-4">
                                        <label>
                                            Game</label>
                                        <select name="ddlgame" className="form-control" onChange={this.handleGameChange}
                                            value={this.state.defaultGame} >
                                            <option key="-1" value="-1">--Select Game--</option>
                                            {this.state.lstGame.map((Game) => <option key={Game.Game_ID} value={Game.Game_ID}>{Game.Game}</option>)}
                                        </select>

                                    </div>

                                    : <div className="col-sm-4">
                                        <label>
                                            Game</label>
                                        <select name="ddlgame" className="form-control" onChange={this.handleGameChange}
                                            value={this.state.defaultGame} >
                                            <option key="-1" value="-1">--Select Game--</option>
                                        </select>

                                    </div>
                                }</div> : <div className="col-sm-4"></div>

                            }

                            
                            <div className="col-sm-6">
                              
                            <button  className="btn btn-primary mt25"
                                ref={(rptButton) => { this.reportButton = rptButton }}
                                onClick={this.props.action} style={{ float: "right" }}>Back to Report </button>

                                </div>
                               
  
                        </div>
                    </div>
                       

                    {this.state.EvalData.length > 0 ?
                        <div>
                            <table id="customers">
                                <thead>
                                    <tr>
                                        <th className="add-column">Rank</th>
                                    <th className="add-column" style={{ textAlign: "left" }}>Referee</th>
                                        <th className="add-column">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.EvalData.map((eachStep, index) => {
                                        let showUpBtn = true;
                                        let showDownBtn = true;
                                        let count = index + 1;
                                        return <tr key={eachStep.Rank_ID} className={(eachStep.Status == '1' && document.getElementById('ReactContent_HiddenRole').value != "League") ? "highlighted" : "" }>
                                            <td className="add-column">{eachStep.Rank_ID}</td>
                                            <td className="add-column" style={{ textAlign: "left" }}>{eachStep.Referee_Name}</td>

                                    <td className="add-column">

                              {(eachStep.Status == '1' || document.getElementById('ReactContent_HiddenRole').value == "League") &&


                                                    <div className="dropdown">
                                                        <div className="dropdown-content">
                                                        {showUpBtn &&

                                                            <img src={up} alt="Up" width="27px" height="27px"
                                                                style={{ marginRight: "2px" }}
                                          onClick={(e) => this.moveStep(e, count, "up", eachStep.Official_ID)} />

                                                            }
                                                        {showDownBtn &&
                                                            <img src={down} alt="Down" width="27px" height="27px"
                                                                style={{ marginLeft: "2px" }}
                                           onClick={(e) => this.moveStep(e, count, "down", eachStep.Official_ID)} />

                                                            }
                                                        </div>
                                                    </div>



                                                }

                                            </td>
                                        </tr>
                                    })}
                                </tbody>
                            </table>
                            <br />
                        
                       
                            <div className="well">
                    <div className="row">
                        <div className="col-sm-6">
                            <label>
                                Comments</label>
                            <div className="form-group green-border-focus">

                                        <textarea className="form-control" id="txtComments" rows="5"
                                            onChange={this.handletxtCommentChange} value={this.state.txtCommentsval}></textarea>
                            </div>

                        </div>
                        
                        <div className="col-sm-6"></div>

                    </div>

                    <div className="row">
                                    <div className="col-sm-4">
                                    <button className="btn btn-primary" style={{marginRight:'10px'}}
                                        onClick={this.handleUpdateButton} title="Update"
                                        disabled={this.state.btnUpdateDisabled} >Update
                            </button>
                                    <button className="btn btn-primary" onClick={this.handleResetButton} title="Reset"
                                        disabled={this.state.btnResetDisabled} >Reset
                            </button>

                                    </div>
                        <div className="col-sm-4">

                        </div>
                        <div className="col-sm-4">

                        </div>

                                </div>
                            </div>
                        </div>
                        : this.state.ShowLoader ?
                        <div id="UpdateProgress1"  role="status" aria-hidden="true">

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
                                        <th className="add-column">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={3}>No records found</td>
                                    </tr>
                                </tbody>
                            </table>}


                </div>
            );
       
    }
}

export default Table;
