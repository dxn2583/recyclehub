// main.js
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

// Fetch data from all collections
const collections = ["glass", "paper", "plastic"];
let allData = [];

async function fetchData() {
  allData = [];

  for (const colName of collections) {
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    snapshot.forEach(doc => {
      const data = doc.data();
      data.category = colName;
      data.status = data.capacity >= 80 ? "Γεμάτος" : "Άδειος";
      allData.push(data);
    });
  }

  populateCityDropdown();
  renderData();
}

function populateCityDropdown() {
  const citySelect = document.getElementById("city");
  const uniqueCities = [...new Set(allData.map(d => d.city))];
  uniqueCities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });
}

function renderData() {
  const categoryFilter = document.getElementById("category").value;
  const cityFilter = document.getElementById("city").value;
  const container = document.getElementById("data-container");
  container.innerHTML = "";

  const filtered = allData.filter(item => {
    const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchCity = cityFilter === "all" || item.city === cityFilter;
    return matchCategory && matchCity;
  });

  if (filtered.length === 0) {
    container.innerHTML = "<p>Δεν βρέθηκαν αποτελέσματα.</p>";
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
}

function formatCategory(category) {
  switch (category) {
    case "glass": return "🍾 Γυαλί";
    case "paper": return "📄 Χαρτί";
    case "plastic": return "♳ Πλαστικό";
    default: return category;
  }
}

// Listeners
document.getElementById("category").addEventListener("change", renderData);
document.getElementById("city").addEventListener("change", renderData);

fetchData();
