import { useEffect, useState } from 'react';
import { CircularProgress, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import '../styles.css';

import TeamCard from '../components/TeamCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');


export default function MainPage() {
    const [tabIndex, setTabIndex] = useState(0); // State to track the active tab index

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Container>
            <Tabs value={tabIndex} onChange={handleTabChange} centered>
                <Tab label="Players" />
                <Tab label="Goals" />
                <Tab label="Wins and Losses" />
                <Tab label="Season Performance" />
            </Tabs>
            {tabIndex === 0 && <PlayersPage />}
            {tabIndex === 1 && <SongsPage />}
            {tabIndex === 2 && <TeamsPage />}
            {tabIndex === 3 && <SeasonPage />}
        </Container>
    );
}

export function PlayersPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [title, setTitle] = useState('');

  useEffect(() => {
    setIsLoadingStats(true);
    fetch(`http://${config.server_host}:${config.server_port}/roster_test`)
      .then(res => res.json())
      .then(resJson => {
        const teamsWithId = resJson.map((team) => ({ id: `${team.team}_${team.season}`, ...team }));
        setData(teamsWithId);
    setIsLoadingStats(false);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/roster_test?title=${title}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const teamsWithId = resJson.map((team) => ({ id: `${team.team}_${team.season}`, ...team }));
        setData(teamsWithId);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'team', headerName: 'Title', width: 160, renderCell: (params) => (
        <Link onClick={() => setSelectedTeam(params.row.team_name)}>{params.value}</Link>
    ) },
    { field: 'season', headerName: 'Season', width: 160 },
    { field: 'league', headerName: 'League', width: 160 },
    {
            field: 'roster',
            headerName: 'Roster',
            width: 520,
            flex: 1,
            renderCell: (params) => (
                <div
                style={{
                    maxHeight: '50px', // Set a smaller max height
                    overflow: 'auto',  // Apply the scrollbar if content overflows
                    whiteSpace: 'nowrap',
                    cursor: 'pointer' // Optional: makes it clear the text is interactable
                    }}
                >
                    {params.value}
                </div>
            ),
 }
  ]

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  return (
    <Container>
      {isLoadingStats && (
        <div className="loading-overlay">
          <CircularProgress size={80} />
        </div>
      )}
      {selectedTeam && <TeamCard songId={selectedTeam} handleClose={() => setSelectedTeam(null)} />}
      <h2>Search Teams</h2>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TextField label='Title' value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
      <DataGrid
                rows={data}
                columns={[
                    { field: 'team', headerName: 'Title', width: 160 },
                    { field: 'season', headerName: 'Season', width: 160 },
                    { field: 'league', headerName: 'League', width: 160 },
                    {
            field: 'roster',
            headerName: 'Roster',
            width: 520,
            flex: 1,
            renderCell: (params) => (
                <div
                style={{
                    maxHeight: '50px', // Set a smaller max height
                    overflow: 'auto',  // Apply the scrollbar if content overflows
                    whiteSpace: 'nowrap',
                    cursor: 'pointer' // Optional: makes it clear the text is interactable
                    }}
                >
                    {params.value}
                </div>
            ),
 }
                ]}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 25]}
                autoHeight
            />
    </Container>
  );
}

export function SongsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [title, setTitle] = useState('');
  const [goals_scored, set_goals_scored] = useState([0, 100]);
  const [goals_conceded, set_goals_conceded] = useState([0, 100]);

  useEffect(() => {
    setIsLoadingStats(true);
    fetch(`http://${config.server_host}:${config.server_port}/total_goals`)
      .then(res => res.json())
      .then(resJson => {
        const teamsWithId = resJson.map((team) => ({ id: `${team.teamID}_${team.season}`, ...team }));
        setData(teamsWithId);
    setIsLoadingStats(false);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/total_goals?title=${title}` +
      `&goals_scored_low=${goals_scored[0]}&goals_scored_high=${goals_scored[1]}` +
      `&goals_conceded=${goals_conceded[0]}&goals_conceded_high=${goals_conceded[1]}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const teamsWithId = resJson.map((team) => ({ id: `${team.teamID}_${team.season}`, ...team }));
        setData(teamsWithId);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'team_name', headerName: 'Title', width: 250, renderCell: (params) => (
        <Link onClick={() => setSelectedTeam(params.row.team_name)}>{params.value}</Link>
    ) },
    { field: 'season', headerName: 'Season', width: 250 },
    { field: 'goals_scored', headerName: 'Goals Scored', width: 250 },
    { field: 'goals_conceded', headerName: 'Goals Conceded', width: 250 }
  ]

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  return (
    <Container>
      {isLoadingStats && (
        <div className="loading-overlay">
          <CircularProgress size={80} />
        </div>
      )}
      {selectedTeam && <TeamCard songId={selectedTeam} handleClose={() => setSelectedTeam(null)} />}
      <h2>Search Teams</h2>
      <Grid container spacing={6}>
        <Grid item xs={8}>
          <TextField label='Title' value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={6}>
          <p>goals_scored</p>
          <Slider
            value={goals_scored}
            min={0}
            max={100}
            step={1}
            onChange={(e, newValue) => set_goals_scored(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
        <Grid item xs={6}>
          <p>goals_conceded</p>
          <Slider
            value={goals_conceded}
            min={0}
            max={100}
            step={1}
            onChange={(e, newValue) => set_goals_conceded(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
      <DataGrid
                rows={data}
                columns={[
                    { field: 'team_name', headerName: 'Title', width: 250 },
                    { field: 'season', headerName: 'Season', width: 250 },
                    { field: 'goals_scored', headerName: 'Goals Scored', width: 250 },
                    { field: 'goals_conceded', headerName: 'Goals Conceded', width: 250 }
                ]}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 25]}
                autoHeight
            />
    </Container>
  );
}

export function TeamsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [title, setTitle] = useState('');
  const [wins, set_wins] = useState([0, 100]);
  const [losses, set_losses] = useState([0, 100]);
  const [draws, set_draws] = useState([0, 100]);

  useEffect(() => {
    setIsLoadingStats(true);
    fetch(`http://${config.server_host}:${config.server_port}/wld_ratios`)
      .then(res => res.json())
      .then(resJson => {
        const teamsWithId = resJson.map((team) => ({ id: `${team.teamID}_${team.season}`, ...team }));
        setData(teamsWithId);
    setIsLoadingStats(false);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/wld_ratios?title=${title}` +
      `&wins_low=${wins[0]}&wins_high=${wins[1]}` +
      `&losses_low=${losses[0]}&losses_high=${losses[1]}` +
      `&draws_low=${draws[0]}&draws_high=${draws[1]}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const teamsWithId = resJson.map((team) => ({ id: `${team.teamID}_${team.season}`, ...team }));
        setData(teamsWithId);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'team_name', headerName: 'Title', width: 180, renderCell: (params) => (
        <Link onClick={() => setSelectedTeam(params.row.team_name)}>{params.value}</Link>
    ) },
    { field: 'season', headerName: 'Season', width: 180 },
    { field: 'total_games', headerName: 'Total Games', width: 180 },
    { field: 'wins', headerName: 'Wins', width: 180 },
    { field: 'losses', headerName: 'Losses', width: 180 },
    { field: 'draws', headerName: 'Draws', width: 180 }
  ]

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  return (
    <Container>
      {isLoadingStats && (
        <div className="loading-overlay">
          <CircularProgress size={80} />
        </div>
      )}
      {selectedTeam && <TeamCard songId={selectedTeam} handleClose={() => setSelectedTeam(null)} />}
      <h2>Search Teams</h2>
      <Grid container spacing={6}>
        <Grid item xs={10}>
          <TextField label='Title' value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={4}>
          <p>Wins</p>
          <Slider
            value={wins}
            min={0}
            max={100}
            step={1}
            onChange={(e, newValue) => set_wins(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
        <Grid item xs={4}>
          <p>Losses</p>
          <Slider
            value={losses}
            min={0}
            max={100}
            step={1}
            onChange={(e, newValue) => set_losses(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
        <Grid item xs={4}>
          <p>Draws</p>
          <Slider
            value={draws}
            min={0}
            max={100}
            step={1}
            onChange={(e, newValue) => set_draws(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
      <DataGrid
                rows={data}
                columns={[
                    { field: 'team_name', headerName: 'Title', width: 180 },
                    { field: 'season', headerName: 'Season', width: 180 },
                    { field: 'total_games', headerName: 'Total Games', width: 180 },
                    { field: 'wins', headerName: 'Wins', width: 180 },
                    { field: 'losses', headerName: 'Losses', width: 180 },
                    { field: 'draws', headerName: 'Draws', width: 180 }
                ]}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 25]}
                autoHeight
            />
    </Container>
  );
}

export function SeasonPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [title, setTitle] = useState('');
  const [goals_per_shot, set_goals_per_shot] = useState([2, 4]);
  const [goals_per_game, set_goals_per_game] = useState([2, 4]);

  useEffect(() => {
    setIsLoadingStats(true);
    fetch(`http://${config.server_host}:${config.server_port}/efficiency`)
      .then(res => res.json())
      .then(resJson => {
        const teamsWithId = resJson.map((team) => ({ id: `${team.teamID}_${team.season}`, ...team }));
        setData(teamsWithId);
    setIsLoadingStats(false);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/efficiency?title=${title}` +
      `&goals_per_shot_low=${goals_per_shot[0]}&goals_per_shot_high=${goals_per_shot[1]}` +
      `&goals_per_game_low=${goals_per_game[0]}&goals_per_game_high=${goals_per_game[1]}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const teamsWithId = resJson.map((team) => ({ id: `${team.teamID}_${team.season}`, ...team }));
        setData(teamsWithId);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'team_name', headerName: 'Title', width: 160, renderCell: (params) => (
        <Link onClick={() => setSelectedTeam(params.row.team_name)}>{params.value}</Link>
    ) },
    { field: 'season', headerName: 'Season', width: 160 },
    { field: 'total_goals', headerName: 'Total Goals', width: 160 },
    { field: 'total_shots', headerName: 'Total Shots', width: 160 },
    { field: 'goals_per_shot', headerName: 'Goals per Shot', width: 160 },
    { field: 'goals_per_game', headerName: 'Goals per Game', width: 160 }
  ]

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  return (
    <Container>
      {isLoadingStats && (
        <div className="loading-overlay">
          <CircularProgress size={80} />
        </div>
      )}
      {selectedTeam && <TeamCard songId={selectedTeam} handleClose={() => setSelectedTeam(null)} />}
      <h2>Search Teams</h2>
      <Grid container spacing={6}>
        <Grid item xs={10}>
          <TextField label='Title' value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={6}>
          <p>Goals per Shot</p>
          <Slider
            value={goals_per_shot}
            min={2}
            max={4}
            step={0.1}
            onChange={(e, newValue) => set_goals_per_shot(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
        <Grid item xs={6}>
          <p>Goals per Page</p>
          <Slider
            value={goals_per_game}
            min={2}
            max={4}
            step={0.1}
            onChange={(e, newValue) => set_goals_per_game(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value}</div>}
          />
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
      <DataGrid
                rows={data}
                columns={[
                    { field: 'team_name', headerName: 'Title', width: 160 },
                    { field: 'season', headerName: 'Season', width: 160 },
                    { field: 'total_goals', headerName: 'Total Goals', width: 160 },
                    { field: 'total_shots', headerName: 'Total Shots', width: 160 },
                    { field: 'goals_per_shot', headerName: 'Goals per Shot', width: 160 },
                    { field: 'goals_per_game', headerName: 'Goals per Game', width: 160 }
                ]}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 25]}
                autoHeight
            />
    </Container>
  );
}
