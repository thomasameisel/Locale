# Locale
### Finds your perfect neighborhood.

Uses the [Chicago Tribune crime data API](https://github.com/newsapps/chicagocrime), along with Foursquare and Zillow.

Users answer a series of fun questions, similar to a Buzzfeed quiz. Based on their responses, the application determines their preferences for several metrics, including crime, nightlife, price, and more. It then ranks the 77 community areas of Chicago by how well they fit the user's preferences and displays them on a map of the city, with information about each.

If time permits, we will also add apartment listings to the application, so users can easily see currently available apartments in their ideal community.

## Tests
Run `npm test` to run all unit tests, including JSHint and JSCS.

## Coding Style
This project uses a lightly modified version of the [node-style-guide](https://github.com/felixge/node-style-guide). Make sure your JavaScript conforms to the appropriate style by running `npm test`. If you feel like the style requirements should be modified, the documentation for JSCS can be found [here](http://jscs.info/overview). Additionally, in the unlikely event that JSHint options need to be modified, [here](http://jshint.com/docs/) is that documentation. The options must be placed in the appropriate `.*rc` file.
