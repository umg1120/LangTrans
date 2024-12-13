const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language"),
  inputTextElem = document.querySelector("#input-text"),
  outputTextElem = document.querySelector("#output-text"),
  inputChars = document.querySelector("#input-chars"),
  swapBtn = document.querySelector(".swap-position"),
  downloadBtn = document.querySelector("#download-btn"),
  uploadDocument = document.querySelector("#upload-document"),
  uploadTitle = document.querySelector("#upload-title"),
  darkModeCheckbox = document.getElementById("dark-mode-btn"),
  translateBtn = document.getElementById('translate-btn'); // Added reference to translate button

// Function to read aloud the translated text
// Function to read aloud the translated text
// Function to read aloud the translated text
// Function to read aloud the translated text
function readAloud() {
  const outputText = document.getElementById("output-text").value; // Get text from output textarea
  const outputLanguage = outputLanguageDropdown.querySelector(".selected").dataset.value; // Get selected language code

  console.log("Output Text:", outputText); // Log the text to check if it's correctly fetched
  console.log("Output Language Code:", outputLanguage); // Log the selected output language code

  if (outputText.trim() !== "") {
    // Step 1: Cancel any ongoing speech tasks
    window.speechSynthesis.cancel();
    console.log("Previous speech cancelled.");

    // Step 2: Create the utterance object
    const utterance = new SpeechSynthesisUtterance(outputText);
    utterance.lang = outputLanguage; // Dynamically set the language

    // Step 3: Get available voices and match the language
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find((voice) => voice.lang === outputLanguage);
    if (selectedVoice) {
      utterance.voice = selectedVoice; // Use the matching voice for the selected language
      console.log(`Voice set to: ${selectedVoice.name}`);
    } else {
      console.warn("No matching voice found for the selected language.");
    }

    utterance.onstart = function () {
      console.log("Reading started...");
    };

    utterance.onend = function () {
      console.log("Reading finished.");
      // Ensure that after speaking, the speech synthesis queue is cleared
      window.speechSynthesis.cancel();
      console.log("Speech synthesis queue cleared after reading.");
    };

    utterance.onerror = function (event) {
      console.error("Error occurred during speech synthesis:", event.error);
    };

    // Step 4: Introduce a small delay before starting the new speech to allow reset
    setTimeout(() => {
      console.log("Starting new speech task...");
      window.speechSynthesis.speak(utterance); // Speak the current text
    }, 500); // 500ms delay to ensure proper reset

  } else {
    console.log("No translated text available to read aloud.");
  }
}

// Add event listener to the "Read Aloud" button
document.getElementById("read-aloud-btn").addEventListener("click", readAloud);

// Function to start speech recognition
function startRecognition() {
  // Create new SpeechRecognition object
  var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  // Fetch the selected language value from the dropdown
  var languageCode = inputLanguageDropdown.querySelector(".selected").dataset.value;

  // Debugging: Log the language code
  console.log("Selected Language Code:", languageCode);

  // Set the recognition language
  recognition.lang = languageCode;
  recognition.interimResults = true; // Enable interim results for real-time updates

  // Select the input text area
  const inputText = document.getElementById('input-text');
  inputText.value = ""; // Clear the input field

  // When recognition results are available
  recognition.onresult = function (event) {
    let transcript = "";

    // Iterate through the results, including interim results
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    // Update the text area with the current transcript
    inputText.value = transcript;

  };

  // Start recognition
  recognition.start();
}



  



// Populate dropdowns with languages
function populateDropdown(dropdown, options) {
  dropdown.querySelector("ul").innerHTML = "";
  options.forEach((option) => {
    const li = document.createElement("li");
    const title = option.name + " (" + option.native + ")";
    li.innerHTML = title;
    li.dataset.value = option.code;
    li.classList.add("option");
    dropdown.querySelector("ul").appendChild(li);
  });
}

populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);

// Add event listeners for dropdowns and input changes
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");
  });

  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
      const selected = dropdown.querySelector(".selected");
      selected.innerHTML = item.innerHTML;
      selected.dataset.value = item.dataset.value;
    });
  });
});

document.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});

// Swap languages and text when swap button is clicked
swapBtn.addEventListener("click", () => {
  const temp = inputLanguageDropdown.querySelector(".selected").innerHTML;
  inputLanguageDropdown.querySelector(".selected").innerHTML =
    outputLanguageDropdown.querySelector(".selected").innerHTML;
  outputLanguageDropdown.querySelector(".selected").innerHTML = temp;

  const tempValue = inputLanguageDropdown.querySelector(".selected").dataset
    .value;
  inputLanguageDropdown.querySelector(".selected").dataset.value =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
  outputLanguageDropdown.querySelector(".selected").dataset.value = tempValue;

  // Swap text between input and output
  const tempInputText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputText;
});

// Function to start translation when the Translate button is clicked
translateBtn.addEventListener("click", function () {
  const inputText = inputTextElem.value;
  const inputLanguage = inputLanguageDropdown.querySelector(".selected").dataset.value;
  const outputLanguage = outputLanguageDropdown.querySelector(".selected").dataset.value;

  if (inputText.trim() === "") {
    alert("Please enter text to translate.");
    return;
  }

  // Send data to the Flask app via POST
  fetch("/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      input_text: inputText,
      input_language: inputLanguage,
      output_language: outputLanguage,
    }),
  })
    .then((response) => response.json())  
    .then((data) => {
      // Set translated text to the output text area
      outputTextElem.value = data.translated_text;
    })
    .catch((error) => {
      console.log("Error:", error);
    });
});

// Handle text input event and character limit
inputTextElem.addEventListener("input", () => {
  if (inputTextElem.value.length > 5000) {
    inputTextElem.value = inputTextElem.value.slice(0, 5000);
  }
  inputChars.innerHTML = inputTextElem.value.length;
  // Removed automatic translate call here, now it only happens when Translate button is clicked
});

// Handle file uploads
uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (
    file.type === "application/pdf" ||
    file.type === "text/plain" ||
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    uploadTitle.innerHTML = file.name;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      inputTextElem.value = e.target.result;
    };
  } else {
    alert("Please upload a valid file");
  }
});

// Handle downloading translated text
downloadBtn.addEventListener("click", () => {
  const outputText = outputTextElem.value;
  const outputLanguage =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
  if (outputText) {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `translated-to-${outputLanguage}.txt`;
    a.href = url;
    a.click();
  }
});

// Toggle dark mode
darkModeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});
