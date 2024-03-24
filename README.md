# EcoRoute

# High level Explanation

The website enables restaurant delivery drivers to find the optimized path for making all their deliveries. The user can pin locations on the map provided and with one click of a button, find the optimal path to make all of their deliveries.

The backend of the website works as follows: 

## API Callings

### 1.HERE Waypoints Sequencing API v8
This API query takes the start co-ordiantes of the user and all the co-ordinates of destinations to be travelled as input and returns the most optimal path. It is assumed that the start and the end are the same location.

### 2. HERE Routing API v8
This API query takes the start co-ordinates and end co-ordinates as input in return displays the route between them on the map

## Working of code

1. **Initializing the Map and User Interaction**
   - The code initializes a map using the HERE Maps API and sets up user interaction features like zooming and panning.
   - It also creates a button or interface element for the user to add delivery locations.

2. **Adding Delivery Locations**
   - When the user clicks on the interface element to add a delivery location, a new input field is dynamically added to the UI.
   - The user can enter the address or coordinates of the delivery location in this input field.

3. **Handling User Input and API Integration**
   - When the user clicks a button to calculate the optimal route, the code gathers the start location (assumed to be the current location) and all the delivery locations entered by the user.
   - It then constructs an API URL with the necessary parameters such as start location, delivery locations, routing mode (e.g., fastest route for cars), and API credentials (API key and app ID).

4. **Making API Requests**
   - The code uses Axios, a popular HTTP client for JavaScript, to send a GET request to the HERE Waypoints Sequencing API v8 with the constructed API URL.
   - Upon receiving the response from the Waypoints Sequencing API, the code extracts the optimized sequence of waypoints (delivery locations) for the driver's route.

5. **Displaying the Route on the Map**
   - Using the optimized sequence of waypoints obtained from the API response, the code calculates the route between each consecutive pair of waypoints using the HERE Routing API v8.
   - The calculated routes are then displayed on the map, showing the driver the optimal path to follow for making all deliveries efficiently.

6. **User Interaction with the Map**
   - The code also handles user interaction with the map, such as clicking on markers representing delivery locations to view additional information or instructions related to each delivery point.
   - The map may also provide features like zooming to specific areas or displaying route details (e.g., turn-by-turn directions) based on user actions.

7. **Error Handling**
   - The code includes error handling mechanisms, such as alerting the user if there's an issue with the API request or if the server cannot be reached.
   - Error messages or notifications are displayed to ensure a smooth user experience and provide feedback in case of any unexpected issues.

## How to use:
1. Use the pencil tool to mark start location on the map
2. Use the respective pencil tools to mark respective destinations on the map
3. After marking all destination points, click on the "Get Route!" button the fetch the path !

