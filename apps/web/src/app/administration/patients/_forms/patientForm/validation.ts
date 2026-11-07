export function validateName(value?: string) {
  if (!value) {
    return "Dieses Feld ist erforderlich";
  }

  return undefined;
}

export function validateSurname(value?: string) {
  return validateName(value);
}

export function validateEmail(value?: string) {
  if (!value) {
    return "Dieses Feld ist erforderlich";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Bitte geben Sie eine gültige E-Mail-Adresse ein";
  }

  return undefined;
}

export function validateDate(value?: Date) {
  if (!value) {
    return "Dieses Feld ist erforderlich";
  }

  return undefined;
}

export function validateStreet(value?: string) {
  if (!value) {
    return "Dieses Feld ist erforderlich";
  }

  return undefined;
}

export function validateCity(value?: string) {
  if (!value) {
    return "Dieses Feld ist erforderlich";
  }

  return undefined;
}

export function validateZip(value?: string) {
  if (!value) {
    return "Dieses Feld ist erforderlich";
  }

  // test if value is a number and has 5 digits
  if (!/^\d{5}$/.test(value)) {
    return "Bitte geben Sie eine gültige Postleitzahl ein";
  }

  return undefined;
}
