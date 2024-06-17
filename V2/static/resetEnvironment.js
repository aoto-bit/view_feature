function resetEnvironment() {
    fetch('/reset-environment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log('Environment reset:', data);
        fetchObservation(); // observationデータの再取得
        fetchAgentData();   // agentデータの再取得
        const activeTab = document.querySelector('.tablinks.active');
        if (activeTab) {
            openTab({ currentTarget: activeTab }, activeTab.textContent);
        }
    })
    .catch(error => console.error('Error resetting environment:', error));
}
