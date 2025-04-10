document.addEventListener('DOMContentLoaded', function() {
    const map = L.map('mapa').setView([4.5709, -74.2973], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const customIcon = L.icon({
        iconUrl: '/static/img/marker.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -35]
    });

    fetch('/api/refugios')
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta de la API');
            return response.json();
        })
        .then(data => {
            data.forEach(refugio => {
                // Crear marcador para cada refugio
                const marker = L.marker(
                    [refugio.latitud, refugio.longitud], 
                    { icon: customIcon }
                ).addTo(map);
                
                // Popup con información del refugio
                marker.bindPopup(`
                    <div style="font-family: Arial, sans-serif; max-width: 250px;">
                        <h3 style="margin: 5px 0; color: #2c3e50;">${refugio.nombre}</h3>
                        <p><strong>📞 Contacto:</strong> ${refugio.contacto}</p>
                        <p><strong>📍 Ubicación:</strong> 
                            ${refugio.latitud.toFixed(4)}, ${refugio.longitud.toFixed(4)}
                        </p>
                        ${refugio.descripcion ? `<p>ℹ ${refugio.descripcion}</p>` : ''}
                    </div>
                `);

                // Evento para hacer zoom al hacer clic en el marcador (solicitado)
                marker.on('click', function() {
                    map.setView(marker.getLatLng(), 12);  // Zoom más cercano
                });
            });
        })
        .catch(error => {
            console.error('Error al cargar refugios:', error);
            // Marcador de ejemplo si falla la API
            L.marker([4.5709, -74.2973])
                .addTo(map)
                .bindPopup('<b>Refugio de ejemplo</b><br>Prueba de funcionalidad');
        });

    map.on('click', function(e) {
        const coords = e.latlng;
        // Actualiza los campos del formulario (asegúrate de que existan en tu HTML)
        if (document.getElementById('latitude')) {
            document.getElementById('latitude').value = coords.lat.toFixed(6);
        }
        if (document.getElementById('longitude')) {
            document.getElementById('longitude').value = coords.lng.toFixed(6);
        }
        
        // Opcional: Mostrar coordenadas en consola
        console.log('Coordenadas click:', coords.lat.toFixed(6), coords.lng.toFixed(6));
    });

    setTimeout(() => {
        map.invalidateSize();
    }, 100);
});