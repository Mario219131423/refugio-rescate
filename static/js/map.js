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

    let selectedMarker = null;

    // Cargar refugios existentes
    fetch('/api/refugios')
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta de la API');
            return response.json();
        })
        .then(data => {
            data.forEach(refugio => {
                const marker = L.marker(
                    [refugio.latitud, refugio.longitud], 
                    { icon: customIcon }
                ).addTo(map);
                
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

                marker.on('click', function() {
                    map.setView(marker.getLatLng(), 12);
                });
            });
        })
        .catch(error => {
            console.error('Error al cargar refugios:', error);
            L.marker([4.5709, -74.2973])
                .addTo(map)
                .bindPopup('<b>Refugio de ejemplo</b><br>Prueba de funcionalidad');
        });

    // Manejar clic en el mapa para seleccionar ubicación
    map.on('click', function(e) {
        const coords = e.latlng;
        
        // Actualizar campos de coordenadas
        document.getElementById('latitud').value = coords.lat.toFixed(6);
        document.getElementById('longitud').value = coords.lng.toFixed(6);
        
        // Actualizar marcador de selección
        if (selectedMarker) {
            map.removeLayer(selectedMarker);
        }
        
        selectedMarker = L.marker(coords, {
            icon: L.divIcon({
                className: 'selected-location-marker',
                html: '<div style="background-color: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(map);
        
        // Hacer zoom a la ubicación seleccionada
        map.setView(coords, 12);
        
        // Mostrar mensaje de confirmación
        const popup = L.popup()
            .setLatLng(coords)
            .setContent('Ubicación seleccionada')
            .openOn(map);
            
        setTimeout(() => {
            map.closePopup(popup);
        }, 2000);
    });

    // Ajustar tamaño del mapa
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
});