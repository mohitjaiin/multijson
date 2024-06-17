const clientId = prompt("Enter your client ID:");
const ws = new WebSocket(`ws://localhost:3000?clientId=${clientId}`);

ws.onopen = () => {
    console.log('Connected to the server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    document.getElementById('name').value = data.name;
    document.getElementById('age').value = data.age;
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

document.getElementById('dataForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const data = { name, age };

    if (!name || isNaN(age)) {
        alert('Please enter valid data');
        return;
    }

    ws.send(JSON.stringify(data));

    fetch(`/data/${clientId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw new Error(error.error); });
        }
        return response.json();
    })
    .then(result => console.log(result))
    .catch(error => console.error('Error:', error));
});

fetch(`/data/${clientId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('name').value = data.name;
        document.getElementById('age').value = data.age;
    })
    .catch(error => console.error('Error:', error));
