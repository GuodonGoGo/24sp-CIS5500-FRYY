import { useEffect, useState } from 'react';
import { Container, Divider, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, List, ListItem, ListItemText } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { NavLink } from 'react-router-dom';


import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
const config = require('../config.json');

export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [topScorers, setTopScorers] = useState([]);
  const [influentialPlayers, setInfluentialPlayers] = useState([]);
  const [clutchPlayers, setClutchPlayers] = useState([]);

  // The useEffect hook by default runs the provided callback after every render
  // The second (optional) argument, [], is the dependency array which signals
  // to the hook to only run the provided callback if the value of the dependency array
  // changes from the previous render. In this case, an empty array means the callback
  // will only run on the very first render.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from the server
        const [topScorersData, influentialPlayersData, clutchPlayersData] = await Promise.all([
          fetch(`http://${config.server_host}:${config.server_port}/top_scorers`),
          fetch(`http://${config.server_host}:${config.server_port}/most_influential_players`),
          fetch(`http://${config.server_host}:${config.server_port}/clutch_players`)
        ]);
        
        // Parse JSON responses
        const topScorers = await topScorersData.json();
        const influentialPlayers = await influentialPlayersData.json();
        const clutchPlayers = await clutchPlayersData.json();

        // Set the state variables with the fetched data
        setTopScorers(topScorers);
        setInfluentialPlayers(influentialPlayers);
        setClutchPlayers(clutchPlayers);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle errors (display an error message to the user)
      }
    };

    fetchData();
  }, []);


  // Define the columns for the top scorers table
  const influentialPlayersColumns = [
    { field: 'player_name', headerName: 'Player', width: 150 },
    { field: 'appearances', headerName: 'Appearances', width: 100, align: 'right' },
    { field: 'total_goals', headerName: 'Goals', width: 80, align: 'right' },
    { field: 'total_assists', headerName: 'Assists', width: 80, align: 'right' },
    { field: 'goals_from_shots', headerName: 'Goals from Shots', width: 150, align: 'right' },
  ];

  // Define the columns for the most influential players table
  const clutchPlayersColumns = [
    { field: 'name', headerName: 'Player', width: 150 }, // Assuming you're using 'name' in your data
    { field: 'late_goals', headerName: 'Late Goals', width: 100, align: 'right' }, 
  ];

  return (
    <Container>
      <Divider />
      <h2>Top 5 Goal Scorers</h2>
      <List>
        {topScorers.slice(0, 5).map((player) => (
          <ListItem key={player.player_id}>
            <ListItemText primary={player.player_name} />
          </ListItem>
        ))}
      </List>

      <Divider />
      <h2>Top 5 Most Influential Players</h2>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="influential players table"> {/* Added aria-label for accessibility */}
          <TableHead>
            <TableRow>
              {influentialPlayersColumns.map((column) => (
                <TableCell key={column.field} align={column.align}>
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {influentialPlayers.map((player) => (
              <TableRow key={player.player_id}>
                {influentialPlayersColumns.map((column) => (
                  <TableCell key={column.field} align={column.align}>
                    {player[column.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />
      <h2>Top 10 Clutch Players</h2>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="clutch players table"> 
          <TableHead>
            <TableRow>
              {clutchPlayersColumns.map((column) => (
                <TableCell key={column.field} align={column.align}>
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {clutchPlayers.slice(0, 10).map((player) => ( // Limit to top 10
              <TableRow key={player.player_id}> 
                {clutchPlayersColumns.map((column) => (
                  <TableCell key={column.field} align={column.align}>
                    {player[column.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </Container>
  );
};