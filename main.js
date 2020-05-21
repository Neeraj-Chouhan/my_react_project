
import React, { Component } from 'react';
import './Tbl.css';
import Table from './table'
import Report from './Report'
import GraphReport from './graphRanking'
import axios from 'axios';


class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            report: true,
            displayChart: false,
            listLeague: [],
            listSeason: [],
            latestSeason:''
        }
        this.handler = this.handler.bind(this);
        this.handlerBack = this.handlerBack.bind(this);
        this.graphHandler = this.graphHandler.bind(this);

    }

    componentDidMount() {

        axios.get(window.$BaseUrl + 'RPSLeague/GetLeague')
            .then(res => {
                const listLeague = res.data;
                this.setState({ listLeague });

                axios.get(window.$BaseUrl + 'RPSSeason/GetSeasons')
                    .then(res => {
                        const lstSeason = res.data;
                        let updatedsortedSeason = lstSeason.sort((a, b) => b.SEASON_ID - a.SEASON_ID);
                        this.setState({ listSeason: updatedsortedSeason});
                    });
            });

    }


    handler(e) {

        e.preventDefault();

        this.setState({
            report: false
        });
    };

    graphHandler(e) {

        e.preventDefault();

        this.setState({
            report: false, displayChart: true
        });

    };

    handlerBack(e) {

        e.preventDefault();

        this.setState({
            report: true
        });
 
        
    };

    render() {

        let dis = "";
        if (this.state.report) {
            dis = <Report action={this.handler} graphAction={this.graphHandler} lstLeague={this.state.listLeague}
                lstSeason={this.state.listSeason}/>;
        } else if (this.state.displayChart) {

            dis = <GraphReport action={this.handlerBack} lstLeague={this.state.listLeague} lstSeason={this.state.listSeason} />;

        }else {
            dis = <Table action={this.handlerBack} />;
        }
        return (
            <div>
                {dis}
           </div>
        );
    }
}

export default Main;
