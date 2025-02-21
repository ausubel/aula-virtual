"use server";

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Add your login logic here
  console.log("Logging in", email, password);
}