# 24sp-CIS5500-Final Project: Soccer Analytics Platform

## Authors
Felix Yuzhou Sun (Email: syz1998@upenn.edu, Github: BBHarbinger)\
Rubo Xing (Email: rubo@seas.upenn.edu, Github: Robbyx1)\
Yifan Wang（Email: yyifan@seas.upenn.edu, Github: Re19710610)\
Yi-Lin Cheng (Email: gocheng@seas.upenn.edu, Github: GuodonGoGo)

## Overview
The application would be a soccer analytics platform where users could understand and interact with soccer data. Using data from the top 5 soccer leagues from 2014-2020, the application would analyze the players' performance, teams' strategies, and their match outcomes. Users would be exposed to data such as goals, assists, shot attempts… etc. The goal of this application is to provide users with insights into match prediction, player value, and team tactics.

## Features
- **Player Analysis:** Explore comprehensive player statistics, including goals, assists, shots, expected goals (xGoals), and more.
- **Team Strategy Insights:** Compare team performances, understand tactical setups through shot patterns, possession stats, and defensive actions.
- **Match Predictions:** Utilize historical data to predict the outcomes of upcoming matches with an in-depth analysis of team form, head-to-head records, and player availabilities.
- **Interactive Visualizations:** Engage with dynamic charts, graphs, and heatmaps that visualize complex soccer data in an intuitive format.

## Dataset Overview
The platform utilizes a relational database structure with tables for 'appearances', 'games', 'leagues', 'players', 'shots', 'teams', and 'teamstats', covering extensive data points from Europe's top five leagues over six seasons.

Dataset source: https://www.kaggle.com/datasets/technika148/football-database

- **Appearances.csv:**
Tracks player appearances in matches, including goals, assists, shots, expected goals, and more. This table serves as a comprehensive source of player performance metrics.
- **Games.csv:**
Contains details about each game, including the teams involved, the final score, probabilities for match outcomes, and half-time scores. This dataset enables analysis of match dynamics and outcomes.
- **Leagues.csv:**
Lists the top five European football leagues covered in this dataset.
- **Players.csv:**
Provides basic information on players, including their names and IDs, essential for linking player-related data across tables.
- **Shots.csv:**
Details each shot taken in the covered matches, including the shooter, assister, minute, situation, and the shot's outcome. This dataset allows for deep dives into shooting efficiency and decision-making on the field.
- **Teams.csv:**
All teams who played in one of the Top5 leagues across seasons from 2014-2020.
- **Teamstats.csv:**
Detailed statistics for each team's games in one of Europe's Top 5 soccer leagues, covering metrics like goals, expected goals, shots, and defensive actions, across a specified season and date range.

## Directory Descriptions:

- **'server/':** Contains all backend-related code, written in Node.js. This includes API's controllers, models (to interact with the MySQL database), and routes. Business logic is placed in services, and config holds configuration files like database connection settings.
- **'client/':** This directory holds the React frontend application, including the components, styles, and app entry points. It's structured to separate UI components from pages and global styles, promoting reusability and modularity.
- **'data/':** Holds the raw database data files.
