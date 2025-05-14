import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCluedYzcLnR1T4kXusU0jJZby5tttEA6o",
  authDomain: "recyclehub-24d3d.firebaseapp.com",
  projectId: "recyclehub-24d3d",
  storageBucket: "recyclehub-24d3d.appspot.com",
  messagingSenderId: "1028280322510",
  appId: "1:1028280322510:web:9d02acb1f611750c37439f",
  measurementId: "G-0DCGGG0CVJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collections = ["glass", "paper", "plastic"];
let allData = [];
let map;
let markers = [];

async function fetchData() {
  allData = [];

  for (const colName of collections) {
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    snapshot.forEach(doc => {
      const data = doc.data();
      data.category = colName;
      data.status = data.capacity >= 80 ? "\u0393\u03b5\u03bc\u03ac\u03c4\u03bf\u03c2" : "\u0386\u03b4\u03b5\u03b9\u03bf\u03c2";
      allData.push(data);
    });
  }

  populateCityDropdown();
  renderData();
  updateMapMarkers();
}

function populateCityDropdown() {
  const citySelect = document.getElementById("city");
  const currentOptions = Array.from(citySelect.options).map(o => o.value);
  const uniqueCities = [...new Set(allData.map(d => d.city))];

  uniqueCities.forEach(city => {
    if (!currentOptions.includes(city)) {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    }
  });
}

function renderData() {
  const categoryFilter = normalizeCategory(document.getElementById("category").value);
  const cityFilter = document.getElementById("city").value;
  const container = document.getElementById("data-container");
  container.innerHTML = "";

  const filtered = allData.filter(item => {
    const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchCity = cityFilter === "\u038c\u03bb\u03b5\u03c2" || item.city === cityFilter;
    return matchCategory && matchCity;
  });

  if (filtered.length === 0) {
    container.innerHTML = "<p>\u0394\u03b5\u03bd \u03b2\u03c1\u03ad\u03b8\u03b7\u03ba\u03b1\u03bd \u03b1\u03c0\u03bf\u03c4\u03b5\u03bb\u03ad\u03c3\u03bc\u03b1\u03c4\u03b1.</p>";
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.city} - ${formatCategory(item.category)}</h3>
      <p>Χωρητικότητα: ${item.capacity}%</p>
      <p>Κατάσταση: <strong>${item.status}</strong></p>
      <p>Συντεταγμένες: ${item.latitude}, ${item.longitude}</p>
    `;
    container.appendChild(card);
  });

  updateMapMarkers();
}

function updateMapMarkers() {
  const categoryFilter = normalizeCategory(document.getElementById("category").value);
  const cityFilter = document.getElementById("city").value;

  markers.forEach(marker => marker.setMap(null));
  markers = [];

  const filtered = allData.filter(item => {
    const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchCity = cityFilter === "\u038c\u03bb\u03b5\u03c2" || item.city === cityFilter;
    return matchCategory && matchCity;
  });

  if (filtered.length === 0) return;

  filtered.forEach(item => {
    const iconUrl = getIconUrl(item.category);
    const marker = new google.maps.Marker({
      position: { lat: item.latitude, lng: item.longitude },
      map: map,
      title: `${item.city} - ${formatCategory(item.category)}`,
      icon: iconUrl,
    });
    markers.push(marker);
  });

  const first = filtered[0];
  if (first) {
    map.setCenter({ lat: first.latitude, lng: first.longitude });
    map.setZoom(13);
  }
}

function normalizeCategory(label) {
  if (label.includes("Πλαστικό")) return "plastic";
  if (label.includes("Χαρτί")) return "paper";
  if (label.includes("Γυαλί")) return "glass";
  return "all";
}

function formatCategory(category) {
  switch (category) {
    case "glass": return "🍾 Γυαλί";
    case "paper": return "📄 Χαρτί";
    case "plastic": return "♳ Πλαστικό";
    default: return category;
  }
}

function getIconUrl(category) {
  switch (category) {
    case "glass": return "https://cdn-icons-png.flaticon.com/512/809/809957.png";
    case "paper": return "https://cdn-icons-png.flaticon.com/512/1995/1995522.png";
    case "plastic": return "https://cdn-icons-png.flaticon.com/512/2593/2593595.png";
    default: return null;
  }
}

document.getElementById("category").addEventListener("change", () => {
  renderData();
});

document.getElementById("city").addEventListener("change", () => {
  renderData();
});

window.initMap = function() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.9838, lng: 23.7275 },
    zoom: 10,
  });
  fetchData();
};
σ
