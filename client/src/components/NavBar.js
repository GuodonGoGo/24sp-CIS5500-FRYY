import { AppBar, Container, Toolbar, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom';

// The hyperlinks in the NavBar contain a lot of repeated formatting code so a
// helper component NavText local to the file is defined to prevent repeated code.
function NavText({ href, text, isMain }) {
  return (
    <Typography
      variant={isMain ? 'h5' : 'h7'}
      noWrap
      style={{
        marginRight: '30px',
        fontFamily: 'Audiowide, sans-serif', // Apply Audiowide font
        fontWeight: isMain ? 700 : 400, 
        letterSpacing: '.3rem',
        color:  'white', // Change to white
        textShadow: '0px 1px 2px rgba(0, 0, 0, 0.15)',
        transition: 'color 0.3s ease' 
      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => { e.target.style.color = '#999999'} } // Example hover
        onMouseLeave={(e) => { e.target.style.color = 'inherit'} }
      >
        {text}
      </NavLink>
    </Typography>
  )
}

// Here, we define the NavBar. Note that we heavily leverage MUI components
// to make the component look nice. Feel free to try changing the formatting
// props to how it changes the look of the component.
export default function NavBar() {
  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <NavText href='/' text='SOCCER-X' isMain />
          <NavText href='/albums' text='TEAMS' />
          <NavText href='/songs' text='NULL' />
          <NavText href='/leagues' text='LEAGUES' />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
