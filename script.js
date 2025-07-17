let userPrefs = {
  name: "—",
  dislikes: [],
  preferredTemp: 0,
  month: null
};

function showToast(message = "Preferences saved!") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}


document.getElementById("preferences-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const dislikes = document.getElementById("dislikes").value.trim().split(",").map(item => item.trim().toLowerCase());
  const preferredTemp = parseInt(document.getElementById("preferredTemp").value);
  const preferredMonth = parseInt(document.getElementById("preferredMonth").value);

  userPrefs = { name, dislikes, preferredTemp, month: preferredMonth };
  showUserPreferences(userPrefs);

  showToast("Preferences saved!");

});

function showUserPreferences(prefs) {
  document.getElementById("pref-name").textContent = prefs.name;
  document.getElementById("pref-dislikes").textContent = prefs.dislikes.join(", ");
  document.getElementById("pref-temp").textContent = prefs.preferredTemp;
  document.getElementById("pref-month").textContent = prefs.month ? getMonthName(prefs.month) : "—";
}

function getMonthName(monthNumber) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return monthNames[monthNumber - 1] || "—";
}

function checkWeather() {
  const city = document.getElementById("cityInput").value;
  const apiKey = "30a575618fe6784d61f3352d26a7c75a";

  if (!city) {
    alert("Please enter a city");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        document.getElementById("weatherResult").innerHTML = `<p>⚠️ ${data.message}</p>`;
        return;
      }

      const weatherData = {
        description: data.weather[0].description,
        temp: Math.round(data.main.temp)
      };

      document.getElementById("weatherResult").innerHTML = `
        <h3>Weather in ${city}</h3>
        <p>${weatherData.description}, ${weatherData.temp}°C</p>
      `;

      generateFakeNotification(userPrefs, weatherData);
    })
    .catch(err => {
      document.getElementById("weatherResult").innerHTML = `<p>❌ Failed to fetch weather. Check connection or city name.</p>`;
    });
}


function generateFakeNotification(userPrefs, weatherData) {
  const { name, dislikes, preferredTemp } = userPrefs;
  const { description, temp } = weatherData;

  let message = `Hey ${name || "there"}! It's ${description} and ${temp}°C. `;

  if (dislikes.includes("rain") && description.includes("rain")) {
    message += "You dislike rain – don’t forget an umbrella ☔.";
  } else if (dislikes.includes("cold") && temp < preferredTemp) {
    message += "It’s colder than you like – wear something warm! 🧥";
  } else if (temp > preferredTemp + 5) {
    message += "It’s hotter than your preference – stay hydrated! 🥤";
  } else {
    message += "Weather looks great – enjoy your day! 🌤️";
  }

  document.getElementById("weatherResult").innerHTML += `<p>${message}</p>`;
}

const indianCityWeather = [
  { city: "Shimla", month: 6, temp: 20, description: "cool and pleasant" },
  { city: "Goa", month: 1, temp: 27, description: "sunny and dry" },
  { city: "Udaipur", month: 11, temp: 22, description: "mild and dry" },
  { city: "Manali", month: 5, temp: 18, description: "cool mountain air" },
  { city: "Kolkata", month: 12, temp: 24, description: "pleasant with festive vibes" },
  { city: "Darjeeling", month: 4, temp: 16, description: "fresh and misty" },
  { city: "Jaipur", month: 2, temp: 23, description: "warm and dry" }
];

function suggestLocation() {
  const { dislikes, preferredTemp, month, name } = userPrefs;

  if (!month || isNaN(preferredTemp)) {
    displaySuggestion("❗ Please set your preferences and select a month.");
    return;
  }

  let matches = indianCityWeather.filter(loc => {
    const tempMatch = Math.abs(loc.temp - preferredTemp) <= 4;
    const dislikeMatch = !dislikes.includes("rain") || !loc.description.includes("rain");
    return loc.month === month && tempMatch && dislikeMatch;
  });

  if (matches.length === 0) {
    matches = indianCityWeather.filter(loc => {
      return loc.month === month && Math.abs(loc.temp - preferredTemp) <= 6;
    });
  }

  if (matches.length === 0) {
    matches = indianCityWeather.filter(loc => loc.month === month);
  }

  if (matches.length === 0) {
    displaySuggestion("😓 No suitable match found this month. Try another month or relax preferences.");
  } else {
    const chosen = matches[Math.floor(Math.random() * matches.length)];
    const message = `
      Hi ${name || "traveler"}! Based on your preferences,
      <strong>${chosen.city}</strong> is a great place to visit in that month. 🌍<br/>
      It usually has <em>${chosen.description}</em> weather around ${chosen.temp}°C.
    `;
    displaySuggestion(message);
  }
}


function displaySuggestion(message) {
  document.getElementById("suggestionResult").innerHTML = message;
}
