const users = [];

const addUser = ({id, username, room}) => {      // destructuring
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: 'Username and Room are require'
        };
    }

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    });

    // if (users && users.filter(a => a.username === username && a.room === room).length)
    if (existingUser) {
        return {
            error: 'User is already exist!'
        }
    }

    const user = { id, username, room }
    users.push(user);
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.filter(user => user.id === id) ? users.filter(user => user.id === id)[0] : 'undefined'
}

const getUserInRoom = (rm) => {
    const room = rm.trim().toLowerCase();
    return users.filter(user => user.room === room) ? users.filter(user => user.room === room) : 'undefined';
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
};