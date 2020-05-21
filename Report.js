
import React, { Component } from 'react';
import IndReport from './individualReport'
import ConReport from './consolidatedReport'
import ConReportTwo from './consoReportTwo'
import ConReportThree from './consoReportThree'
import axios from 'axios';


class Report extends Component {

    constructor(props) {
        super(props);

        this.state = {
            indiData: [],
            lstLeague: [],
            rdValue: '1',
            displayLoader: true,
            DAid: 0,
            fromIndiReport: false,
            changedLeague: '',
            changeSeason:''

           
          
           
        }
        this.handleDAClick = this.handleDAClick.bind(this);
        this.backButtonClick = this.backButtonClick.bind(this);
        this.consoReportTwoClick = this.consoReportTwoClick.bind(this);
        
    }

    componentDidMount() {

        if (document.getElementById('ReactContent_HiddenRole').value === "Admin") {

            this.setState({
                rdValue: '2'
            });
        }

    }

    backButtonClick(e) {

        e.preventDefault();

        this.setState({

            rdValue: '2',
            fromIndiReport: true

        });
    };

    handleDAClick(e) {

        e.preventDefault();

        let League = e.target.name;
        let Season = e.target.type;

        this.setState({

            rdValue: '1',
            DAid: e.target.id,
            changedLeague: e.target.name,
            changeSeason: e.target.type
          
        });

       
       
    }

    consoReportTwoClick(val) {

        if (val == '2') {

            this.setState({

                rdValue: '3'

            });

        } else if (val == '3') {

            this.setState({

                rdValue: '4'

            });


        }else {

            this.setState({

                rdValue: '2'

            });

        }

       

    }

    render() {

        let disReport = "";

        if (this.state.rdValue === '2') {
            disReport = <ConReport action={this.handleDAClick} lstLeague={this.props.lstLeague} lstSeason={this.props.lstSeason}

                graphAction={this.props.graphAction} consoReportTwoClick={this.consoReportTwoClick}
                fromIndiReport={this.state.fromIndiReport} />;

        } else if(this.state.rdValue === '3') {

            disReport = <ConReportTwo key="i5"  lstLeague={this.props.lstLeague}
                lstSeason={this.props.lstSeason} consoReportTwoClick={this.consoReportTwoClick}
                graphAction={this.props.graphAction} />;

        } else if (this.state.rdValue === '4') {

            disReport = <ConReportThree key="i5" lstLeague={this.props.lstLeague}
                lstSeason={this.props.lstSeason} consoReportTwoClick={this.consoReportTwoClick}
                graphAction={this.props.graphAction} />;

        }else{

            disReport = <IndReport key="i5" showLoader={this.state.displayLoader} lstLeague={this.props.lstLeague}
                lstSeason={this.props.lstSeason} action={this.props.action} DaId={this.state.DAid}
                backButtonClick={this.backButtonClick} newLeague={this.state.changedLeague} newSeason={this.state.changeSeason} />;
  
            }
        
        return (

            <div >
                {disReport}
            </div>
        );
    }
}

export default Report;