const form = document.getElementById("authForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const action = event.submitter.id;

  const endpoint = action === "signup" ? "/signup" : "/login";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    window.location.href = "/chat.html";
  } else {
    alert(await response.text());
  }
});
