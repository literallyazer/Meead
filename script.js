const apiKey = '8LcaY6ntOG7zO0S8Z8fnIjrVUn62cbUP';

document.getElementById('searchBtn').addEventListener('click', getLocation);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    searchEvents(latitude, longitude);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

function searchEvents(latitude, longitude) {
    const locationInput = document.getElementById('location').value;
    const categoryInput = document.getElementById('category').value;
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = ''; // Clear previous results

    const fetchUrl = latitude && longitude
        ? `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&latlong=${latitude},${longitude}`
        : locationInput
            ? `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${locationInput}`
            : null;

    if (fetchUrl) {
        fetch(fetchUrl)
            .then(response => response.json())
            .then(data => displayEvents(data, categoryInput))
            .catch(error => handleError(error));
    } else {
        alert('Please enter a location or allow location access.');
    }
}

function displayEvents(data, category) {
    const eventsList = document.getElementById('eventsList');
    if (data._embedded && data._embedded.events.length > 0) {
        const events = data._embedded.events;
        events.forEach(event => {
            if (!category || event.type === category) { // Filter by category
                const eventCard = `
                <div class="event-card">
                    <h5>${event.name}</h5>
                    <p><strong>Date:</strong> ${event.dates.start.localDate}</p>
                    <p><strong>Venue:</strong> ${event._embedded.venues[0].name}</p>
                    <p><strong>Time Remaining:</strong> ${startCountdown(event.dates.start.localDate)} until event starts</p>
                    <a href="${event.url}" class="btn btn-primary" target="_blank">Buy Tickets</a>
                    <button class="btn btn-secondary mt-2" onclick="addToFavorites('${event.name}')">Add to Favorites</button>
                    <a href="https://twitter.com/intent/tweet?text=Check out this event: ${event.url}" target="_blank" class="btn btn-info mt-2">Share on Twitter</a>
                </div>
                `;
                eventsList.innerHTML += eventCard;
            }
        });
    } else {
        eventsList.innerHTML = '<p>No events found for this location.</p>';
    }
}

function startCountdown(eventDate) {
    const eventDateTime = new Date(eventDate).getTime();
    const now = new Date().getTime();
    const distance = eventDateTime - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
}

function addToFavorites(eventName) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.push(eventName);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${eventName} added to favorites!`);
}

function handleError(error) {
    console.error('Error fetching events:', error);
    alert('Could not fetch events. Please try again later.');
}
