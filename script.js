function initMap() {
    // Get your Google Maps API Key (replace 'YOUR_GOOGLE_MAPS_API_KEY')
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7128, lng: -74.0060 }, // Default center
        zoom: 10
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Autocomplete for destination
    const destinationInput = document.getElementById('destination');
    const autocomplete = new google.maps.places.Autocomplete(destinationInput);

    // Get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const start = { lat: position.coords.latitude, lng: position.coords.longitude };
                document.getElementById('start').value = `${start.lat}, ${start.lng}`; // Display location

                const fuelForm = document.getElementById('fuel-form');
                fuelForm.addEventListener('submit', function(event) {
                    event.preventDefault(); // Prevent form submission

                    const destination = destinationInput.value;

                    // Calculate route and fuel estimate
                    calculateFuel(start, destination, directionsService, directionsRenderer);
                });
            },
            function(error) {
                // Handle geolocation errors
                console.error("Error getting location:", error);
                document.getElementById('start').value = "Location Not Found";
                alert("Error getting your location. Please check your browser settings.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
        document.getElementById('start').value = "Location Not Supported";
    }
}

// Function to calculate fuel estimate
function calculateFuel(start, destination, directionsService, directionsRenderer) {
    const directionsRequest = {
        origin: start,
        destination: destination,
        travelMode: 'DRIVING'
    };

    directionsService.route(directionsRequest, function(response, status) {
        if (status === 'OK') {
            const distance = response.routes[0].legs[0].distance.value; // Distance in meters
            directionsRenderer.setDirections(response); // Display route

            // Fuel Consumption Calculation (based on your car's figures)
            const cityConsumption = 42.2; // mpg
            const highwayConsumption = 65.7; // mpg
            const combinedConsumption = 54.3; // mpg

            //  Get average speed on the route 
            const averageSpeed = response.routes[0].legs[0].duration.value / 3600; // In km/h

            // Approximate fuel consumption based on speed
            let fuelConsumption = combinedConsumption; // Default to combined
            if (averageSpeed > 80) { 
                fuelConsumption = highwayConsumption; 
            } else if (averageSpeed < 40) {
                fuelConsumption = cityConsumption;
            }

            // Convert mpg to liters per 100 km
            const litersPer100Km = 282.48 / fuelConsumption;

            // Calculate fuel needed in liters
            const fuelNeededLiters = (distance / 1000) * litersPer100Km;

            // Display fuel estimate
            document.getElementById('fuel-estimate').textContent = `Fuel Estimate: ${fuelNeededLiters.toFixed(2)} liters`;
        } else {
            // Handle errors
            console.error("Error calculating route:", status);
            alert(`Error calculating route: ${status}. Please check your destination.`);
        }
    });
}
