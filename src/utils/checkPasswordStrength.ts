export function checkPasswordStrength(password: string): "weak" | "medium" | "strong" {
  let strength = 0;

  if (password.length >= 6) strength++;                  // basic length
  if (/[A-Z]/.test(password)) strength++;                // uppercase
  if (/[0-9]/.test(password)) strength++;                // number
  if (/[^A-Za-z0-9]/.test(password)) strength++;         // special char
  if (password.length >= 10) strength++;                 // long strong password

  if (strength <= 2) return "weak";
  if (strength === 3 || strength === 4) return "medium";
  return "strong"; // strength >= 5
}
