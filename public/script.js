// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const signUpBtn = document.getElementById("signUpBtn");
  const loginBtn = document.getElementById("loginBtn");
  const authOptions = document.getElementById("authOptions");
  const signUpForm = document.getElementById("signUpForm");
  const loginForm = document.getElementById("loginForm");
  const submitSignUp = document.getElementById("submitSignUp");
  const submitLogin = document.getElementById("submitLogin");
  const backToMainFromSignUp = document.getElementById("backToMainFromSignUp");
  const backToMainFromLogin = document.getElementById("backToMainFromLogin");

  // Show Sign Up Form
  signUpBtn.addEventListener("click", () => {
      authOptions.classList.add("hidden");
      signUpForm.classList.remove("hidden");
  });

  // Show Login Form
  loginBtn.addEventListener("click", () => {
      authOptions.classList.add("hidden");
      loginForm.classList.remove("hidden");
  });

  // Back to Main Page from Sign Up Form
  backToMainFromSignUp.addEventListener("click", () => {
      signUpForm.classList.add("hidden");
      authOptions.classList.remove("hidden");
  });

  // Back to Main Page from Login Form
  backToMainFromLogin.addEventListener("click", () => {
      loginForm.classList.add("hidden");
      authOptions.classList.remove("hidden");
  });

  // Handle Sign Up Form Submission
  submitSignUp.addEventListener("click", async (event) => {
      event.preventDefault(); // Prevent form from refreshing the page

      const username = document.getElementById("signUpUsername").value.trim();
      const email = document.getElementById("signUpEmail").value.trim();
      const password = document.getElementById("signUpPassword").value.trim();

      if (!username || !email || !password) {
          alert("Please fill in all fields.");
          return;
      }

      try {
          const response = await fetch('/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, email, password }),
          });

          const data = await response.json();
          if (response.ok) {
              alert(`Signup successful! Welcome, ${data.username}`);
              window.location.href = "/chat"; // Redirect to the chat page on success
          } else {
              alert(data.message);
          }
      } catch (err) {
          console.error(err);
          alert('Error during signup');
      }
  });

  // Handle Login Form Submission
  submitLogin.addEventListener("click", async (event) => {
      event.preventDefault(); // Prevent form from refreshing the page

      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!username || !password) {
          alert("Please fill in all fields.");
          return;
      }

      try {
          const response = await fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password }),
          });

          const data = await response.json();
          if (response.ok) {
              alert(`Login successful! Welcome back, ${data.username}`);
              window.location.href = "/chat"; // Redirect to the chat page on success
          } else {
              alert(data.message);
          }
      } catch (err) {
          console.error(err);
          alert('Error during login');
      }
  });
});
