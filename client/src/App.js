import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import LeaguesPage from './pages/LeaguesPage'

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    mode: 'dark',  // Optional: Consider a dark mode base for extra elegance
    primary: {
      main: '#ffffff', 
    },
    secondary: {
      main: '#ff0000',
    },
    text: {
      primary: '#eeeeee',
      secondary: '#999999',
    },
  },
  typography: {
    fontFamily: ['Roboto', 'sans-serif'].join(','),
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/leagues" element={<LeaguesPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
