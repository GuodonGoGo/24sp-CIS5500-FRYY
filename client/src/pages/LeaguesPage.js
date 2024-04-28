import { useEffect, useState } from 'react';
import { Button, Container, Grid, Slider, Select, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const config = require('../config.json');

export default function LeaguesPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);

  const [season, setSeason] = useState([2014, 2020]);
  const [metric, setMetric] = useState('overall');

  // useEffect(() => {
  //   fetch(`http://${config.server_host}:${config.server_port}/top_leagues`)
  //   .then(res => res.json())
  //   .then(resJson => {
  //     const leaguesData = resJson.map((league) => ({ id: league.leagueID, ...league }));
  //     setData(leaguesData);
  //   });
  // }, []);

  const search = () => {
    // Check which metric the user want to look at
    // They can choose to look at overall, offensive, or defensive
    let endpoint = '';
    switch (metric) {
      case 'overall':
        endpoint = '/top_leagues';
        break;
      case 'offensive':
        endpoint = '/top_offensive_leagues';
        break;
      case 'defensive':
        endpoint = '/top_defensive_leagues';
        break;
      default:
        endpoint = '/top_leagues';
        break;
    }

    // Check if the user wants to look at a specific season
    // If they do, add the season to the endpoint
    if (season) {
      endpoint += `?startSeason=${season[0]}&endSeason=${season[1]}`;
    }

    fetch(`http://${config.server_host}:${config.server_port}${endpoint}`)
      .then(res => res.json())
      .then(resJson => {
        const leaguesData = resJson.map((league) => ({ id: league.leagueID, ...league }));
        setData(leaguesData);
      });
  }

  // Defien the columns for difference league metric searches
  const overallColumns = [
    { field: 'league_name', headerName: 'League Name' },
    { field: 'avg_total_goals', headerName: 'Avg Total Goals' },
    { field: 'avg_goal_difference', headerName: 'Avg Goal Difference' },
  ];

  const offensiveColumns = [
    { field: 'league_name', headerName: 'League Name' },
    { field: 'avg_goals', headerName: 'Avg Goals' },
    { field: 'avg_expected_goals', headerName: 'Avg Expected Goals' },
    { field: 'avg_shots', headerName: 'Avg Shots' },
    { field: 'avg_shots_on_target', headerName: 'Avg Shots on Target' },
    { field: 'avg_deep_shots', headerName: 'Avg Deep Shots' },
    { field: 'avg_corners', headerName: 'Avg Corners' },
  ];

  const defensiveColumns = [
    { field: 'league_name', headerName: 'League Name' },
    { field: 'avg_goals_conceded', headerName: 'Avg Goals Conceded' },
    { field: 'avg_shots_faced', headerName: 'Avg Shots Faced' },
    { field: 'avg_ppda', headerName: 'Avg PPDA' },
  ];

  // Update the columns based on the selected metric
  let selectedColumns;
  switch (metric) {
    case 'overall':
      selectedColumns = overallColumns;
      break;
    case 'offensive':
      selectedColumns = offensiveColumns;
      break;
    case 'defensive':
      selectedColumns = defensiveColumns;
      break;
    default:
      selectedColumns = overallColumns; // Default to overall columns
      break;
  }

  return (
    <Container>
      <h2>League Performances</h2>
      <Grid container spacing={6}>
        <Grid item xs = {6}>
          <Select 
            value={metric} 
            onChange={(e) => setMetric(e.target.value)} 
            fullWidth
          >
            <MenuItem value="overall">Overall</MenuItem>
            <MenuItem value="offensive">Offensive</MenuItem>
            <MenuItem value="defensive">Defensive</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={6}>
          <p>Season</p>
          <Slider
            value={season}
            min={2014}
            max={2020}
            step={1}
            onChange={(e, newValue) => setSeason(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
      <DataGrid
        rows={data}
        columns={selectedColumns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
        columnBuffer={8}
      />
    </Container>
  );
}