<template>
  <div class="contact-page">
    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h4>Contact Information</h4>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <h6>Phone</h6>
                <p>+1 (555) 123-BALL</p>
              </div>
              <div class="col-md-4">
                <h6>Email</h6>
                <p>basketball@university.edu</p>
              </div>
              <div class="col-md-4">
                <h6>Office</h6>
                <p>Wellington Road, Clayton, VIC 3800</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h4>Find Our Location</h4>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search for places..."
                    v-model="searchQuery"
                    @keyup.enter="searchPlaces"
                  >
                  <button class="btn btn-primary" @click="searchPlaces" :disabled="!searchQuery.trim()">
                    Search
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <div class="btn-group" role="group">
                  <button
                    class="btn btn-outline-primary"
                    :class="{ 'active': routingMode }"
                    @click="toggleRouting"
                  >
                    {{ routingMode ? 'Stop Routing' : 'Start Routing' }}
                  </button>
                  <button class="btn btn-outline-secondary" @click="getUserLocation">
                    My Location
                  </button>
                </div>
              </div>
            </div>

            <div id="map" style="height: 400px; width: 100%; border-radius: 0.375rem; overflow: hidden;"></div>

            <div v-if="loading" class="mt-3 text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-if="error" class="mt-3 alert alert-danger" role="alert">
              {{ error }}
            </div>

            <div v-if="searchResults.length > 0" class="mt-3">
              <h6>Search Results:</h6>
              <div class="list-group">
                <a
                  v-for="result in searchResults"
                  :key="result.id"
                  href="#"
                  class="list-group-item list-group-item-action"
                  @click.prevent="focusOnResult(result)"
                >
                  <strong>{{ result.text }}</strong><br>
                  <small class="text-muted">{{ result.place_name }}</small>
                </a>
              </div>
            </div>

            <div v-if="routeInfo" class="mt-3 p-3 bg-light rounded">
              <h6>Route Information:</h6>
              <p><strong>Distance:</strong> {{ routeInfo.distance }} km</p>
              <p><strong>Duration:</strong> {{ routeInfo.duration }} minutes</p>
              <button class="btn btn-sm btn-outline-danger" @click="clearRoute">
                Clear Route
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiamF5eGNhdHMiLCJhIjoiY21ncTFxdGl3Mmk4eTJqcHFzMTgyOHQwcSJ9.L3AEiq_aLblbdUQ_N09hrA'

const searchQuery = ref('')
const searchResults = ref([])
const routingMode = ref(false)
const routeInfo = ref(null)
const loading = ref(false)
const error = ref('')

let map = null
let markers = []
let routeLayer = null

const OFFICE_COORDINATES = [145.1365, -37.9142]

onMounted(() => {
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN !== 'pk.eyJ1IjoiamF5eGNhdHMiLCJhIjoiY21ncTFxdGl3Mmk4eTJqcHFzMTgyOHQwcSJ9.L3AEiq_aLblbdUQ_N09hrA') {
    error.value = 'Please configure your Mapbox token first'
    return
  }

  try {
    mapboxgl.accessToken = MAPBOX_TOKEN

    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: OFFICE_COORDINATES,
      zoom: 14
    })

    map.on('load', () => {
      map.addControl(new mapboxgl.NavigationControl())

      map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true
      }))

      addOfficeMarker()
    })

    map.on('click', (e) => {
      if (routingMode.value && markers.length < 3) {
        addRoutePoint(e.lngLat)
      }
    })

  } catch (err) {
    console.error('Map initialization error:', err)
    error.value = 'Failed to initialize map. Please check your Mapbox token.'
  }
})

const addOfficeMarker = () => {
  if (!map) return

  const officeMarker = new mapboxgl.Marker({ color: 'red' })
    .setLngLat(OFFICE_COORDINATES)
    .setPopup(new mapboxgl.Popup().setHTML(`
      <h6>Basketball Office</h6>
      <p>Wellington Road, Clayton, VIC 3800</p>
      <p><small>Phone: +1 (555) 123-BALL</small></p>
      <p><small>Email: basketball@university.edu</small></p>
    `))
    .addTo(map)

  markers.push(officeMarker)
}

const searchPlaces = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  error.value = ''
  searchResults.value = []

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery.value)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
    )

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const data = await response.json()
    searchResults.value = data.features

    if (data.features.length === 0) {
      error.value = 'No results found for your search'
    }
  } catch (err) {
    console.error('Search error:', err)
    error.value = 'Search failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const focusOnResult = (result) => {
  if (!map) return

  const [lng, lat] = result.center
  map.flyTo({ center: [lng, lat], zoom: 14 })

  const marker = new mapboxgl.Marker({ color: 'blue' })
    .setLngLat([lng, lat])
    .setPopup(new mapboxgl.Popup().setHTML(`
      <h6>${result.text}</h6>
      <p>${result.place_name}</p>
    `))
    .addTo(map)

  markers.push(marker)
  searchResults.value = []
  searchQuery.value = ''
}

const toggleRouting = () => {
  routingMode.value = !routingMode.value
  if (!routingMode.value) {
    clearRoute()
  }
}

const addRoutePoint = async (lngLat) => {
  if (!map) return

  const marker = new mapboxgl.Marker({ color: 'green' })
    .setLngLat(lngLat)
    .addTo(map)

  markers.push(marker)

  if (markers.length === 3) {
    await calculateRoute()
  }
}

const calculateRoute = async () => {
  if (markers.length < 3 || !map) return

  loading.value = true
  error.value = ''

  try {
    const coordinates = markers.slice(1).map(marker => marker.getLngLat().toArray()).join(';')

    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
    )

    if (!response.ok) {
      throw new Error(`Routing failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      routeInfo.value = {
        distance: (route.distance / 1000).toFixed(2),
        duration: Math.round(route.duration / 60)
      }

      drawRoute(route.geometry)
    } else {
      error.value = 'No route found between the selected points'
    }
  } catch (err) {
    console.error('Routing error:', err)
    error.value = 'Failed to calculate route. Please try again.'
  } finally {
    loading.value = false
  }
}

const drawRoute = (geometry) => {
  if (!map) return

  if (routeLayer) {
    if (map.getLayer('route')) map.removeLayer('route')
    if (map.getSource('route')) map.removeSource('route')
  }

  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: geometry
    }
  })

  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be',
      'line-width': 5,
      'line-opacity': 0.75
    }
  })

  routeLayer = true
}

const getUserLocation = () => {
  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by your browser'
    return
  }

  if (!map) {
    error.value = 'Map is not initialized'
    return
  }

  loading.value = true
  error.value = ''

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      map.flyTo({ center: [longitude, latitude], zoom: 14 })

      const marker = new mapboxgl.Marker({ color: 'orange' })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setHTML('<h6>Your Location</h6>'))
        .addTo(map)

      markers.push(marker)
      loading.value = false
    },
    (err) => {
      console.error('Geolocation error:', err)
      error.value = 'Unable to retrieve your location. Please ensure location services are enabled.'
      loading.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  )
}

const clearRoute = () => {
  if (!map) return

  markers.slice(1).forEach(marker => marker.remove())
  markers = markers.slice(0, 1)

  if (routeLayer) {
    if (map.getLayer('route')) map.removeLayer('route')
    if (map.getSource('route')) map.removeSource('route')
    routeLayer = null
  }

  routeInfo.value = null
  routingMode.value = false
  error.value = ''
}
</script>
