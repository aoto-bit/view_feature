function fetchAgentData() {
    fetch('/get-agent-data')
        .then(response => response.json())
        .then(data => {
            console.log('Agent data:', data); // コンソールにデータを出力
            document.getElementById('position').textContent = `Position: ${data.position}`;
            document.getElementById('angle').textContent = `Angle: ${data.angle}`;
        })
        .catch(error => console.error('Error fetching agent data:', error));
}

document.addEventListener('DOMContentLoaded', fetchAgentData);
