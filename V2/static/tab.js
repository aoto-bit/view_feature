function openTab(evt, layerName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(layerName).style.display = "block";
    evt.currentTarget.className += " active";
    
    if (layerName === 'Noisy') {
        fetch('/get-noisy-data')
            .then(response => response.json())
            .then(data => {
                console.log(`Data for ${layerName} layers:`, data); // コンソールにデータを出力
                drawNoisyLayers(data, 'content-' + layerName);
            })
            .catch(error => console.error('Error fetching noisy data:', error));
    } else if (layerName === 'Outputs') {
        fetch('/get-model-output')
            .then(response => response.json())
            .then(data => {
                console.log(`Model output data:`, data); // コンソールにデータを出力
                drawOutput(data, 'output-canvas');
            })
            .catch(error => console.error('Error fetching model output data:', error));
    } else {
        fetch('/get-data/' + layerName)
            .then(response => response.json())
            .then(data => {
                console.log(`Data for layer ${layerName}:`, data); // コンソールにデータを出力
                drawFeatureMap(data, 'content-' + layerName);
            })
            .catch(error => console.error('Error fetching layer data:', error));
    }
}
