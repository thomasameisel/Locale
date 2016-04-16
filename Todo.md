### Most Important
- [x] Make questionnaire submit button float and greyed out when the questionnaire is incomplete
  - if the directions request is not done, a loading icon should appear after the user presses submit
- [ ] Change preferences bars hue to support green/red colorblindness
- [ ] Put tick mark on preferences bars to display user selections
- [ ] Denote that middle line on preferences bars is city average
- [x] Make top bar float
- [ ] Change landing page search to only accept cities that we have (only Chicago for now)
  - leaving the input box blank prints 'NO_RESULTS' next to the box
- [ ] Change stars on map page to make it clear that they are based on preferences
- [ ] Clicking the answer to a question should automatically scroll to the next question

### Stretch Goals
- [ ] Preferences don't show up in the same order for every community in the detail view
- [ ] Only allow users to select a work place in their selected city
- [ ] BUG: when you refresh the map, no communities appear, it doesn't keep the directions object
- [ ] Add more cities (NYC, San Francisco, Nashville)
- [ ] Automatically do a directions request (user does not have to press button)
  - do not take the user back to landing page, just change city in the questionnaire
  - void out work place when the user changes the city
- [ ] Change how getAllData fails (send an email if failed)
- [ ] Set up CD to test and deploy to Elastic Beanstalk upon push
- [ ] Write more tests
- [ ] write tests for the frontend (using phantom potentially)

### Completed
- [x] BUG: when the user does not move the slidebar, the time is the last value used (not 10)
  - for example, if the user puts in the value 15 for the time then clicks submit then goes back to the questionnaire
  and does not move the slidebar (it shows 10 minutes), the new request will use 15 instead of 10
- [x] Change the params city key based on the city the user selects
- [x] Figure out how to correctly invert the crime, crowded, etc. (divide by half of max?)
- [x] Add the rest of the directions for the 600 coordinates
- [x] Migrate to AWS and possibly setup a chron job to automatically update the community data periodically
- [x] Write code to automatically add community areas based on KML
- [x] Allow users to not enter the work place (put a checkbox for enable directions)
  - the slidebar on the maps page should also not appear in this situation
- [x] Make the map repopulation smooth when changing directions time
- [x] Add a button to go back to the questionnaire (top right in the title bar "Retake Survey")
- [x] Add a button to change the city (next to retake in title bar)
- [x] Add a picture of a city to background of landing page
- [x] Put shadow on title bar
- [x] Set up DNS routing for website
- [x] Add more communities to database
- [x] Separate violent and non-violent crime
- [x] Move to Docker
