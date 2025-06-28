document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") === "true") {
    window.location.href = "index.html";
    return;
  }

  const backgroundContainer = document.getElementById("background-container");
  const backgroundImages = ["1.jpg", "2.jpg", "3.jpg"];
  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  backgroundContainer.style.backgroundImage = `url('${backgroundImages[randomIndex]}')`;

  const loginForm = document.getElementById("loginForm");
  const companyNameInput = document.getElementById("companyNameLogin");
  const roleSelect = document.getElementById("roleSelect");
  const nameInput = document.getElementById("loginName");
  const errorMessage = document.getElementById("error-message");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const companyName = companyNameInput.value.trim();
    const selectedRole = roleSelect.value;
    const enteredName = nameInput.value.trim();

    if (companyName && selectedRole && enteredName) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("companyName", companyName);
      localStorage.setItem("loginRole", selectedRole);
      localStorage.setItem("loginName", enteredName);
      window.location.href = "index.html";
    } else {
      errorMessage.textContent = "모든 항목을 입력 또는 선택해주세요.";
    }
  });
});
