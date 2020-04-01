const socket = io();

const $message = document.querySelector('#message');
const $addClient = document.querySelector('#submit');
const $addLocation = document.querySelector('#geoLocation');
const $msg = document.querySelector('#msg');

// Template
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplete = document.querySelector('#sidebar-template').innerHTML;

// Query Params
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoScroll = () => {
    // new message
    const $newMessage = $msg.lastElementChild;

    // height of new msg
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin; 

    // visible height
    const visibleHeight = $msg.offsetHeight;

    // Height of messge container
    const containerHeight = $msg.scrollHeight;

    // How far i scroll?
    const scrollOffset = $msg.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $msg.scrollTop = $msg.scrollHeight;
    }

    console.log(newMessageMargin);
}

socket.on('newUser', (message) => {
    const html = Mustache.render(messageTemplate, {
       username: message.username,
       message: message.text,
       createdAt: moment(message.createdAt).format('h:mm a') 
        // message: message.text,
    });
    $msg.insertAdjacentHTML('beforeend',html);

    autoScroll();
});

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt:  moment(message.createdAt).format('h:mm a') 
    });
    $msg.insertAdjacentHTML('beforeend',html);

    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
   const html = Mustache.render(sidebarTemplete, {
       room, 
       users
   });
   document.querySelector('#sidebar').innerHTML = html
});

function myFunction() {
    $addClient.setAttribute('disabled','disabled');
    socket.emit('inputValue', document.getElementById("message").value,(error) => {
        $addClient.removeAttribute('disabled');
        $message.value = '';
        $message.focus();

        if (error) {
            return console.log(error);
        }
        console.log('Message has been delivered');
    });
}

function shareLocation() {
    $addLocation.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((loc) => {
        if (!loc) {
            alert('Geolocation is not supported by browser');
        }
        const location = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
        }

        socket.emit('locationValue', location, (locMessage) => {
            $addLocation.removeAttribute('disabled');
            console.log(locMessage);
        });
    })
}

socket.emit('join', { username, room}, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    } 
});