function setAction(key) {
    fetch('/set-action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: key }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Action set:', data);
        fetchObservation(); // observationデータの再取得
        fetchAgentData();   // agentデータの再取得
        const activeTab = document.querySelector('.tablinks.active');
        if (activeTab) {
            openTab({ currentTarget: activeTab }, activeTab.textContent);
        }
    })
    .catch(error => console.error('Error setting action:', error));
}

function handleKeyClick(key) {
    setAction(key);
}
