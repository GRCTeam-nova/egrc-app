export const CONTROL_FREQUENCY_OPTIONS = [
  { id: 1, nome: "Várias vezes ao dia" },
  { id: 2, nome: "Diário" },
  { id: 3, nome: "Semanal" },
  { id: 4, nome: "Quinzenal" },
  { id: 5, nome: "Mensal" },
  { id: 6, nome: "Bimestral" },
  { id: 7, nome: "Trimestral" },
  { id: 8, nome: "Semestral" },
  { id: 9, nome: "Anual" },
  { id: 10, nome: "Bienal" },
  { id: 11, nome: "Quinquenal" },
];

const CONTROL_FREQUENCY_LABELS = CONTROL_FREQUENCY_OPTIONS.reduce(
  (accumulator, option) => {
    accumulator[String(option.id)] = option.nome;
    return accumulator;
  },
  {},
);

export function getControlFrequencyLabel(frequency) {
  if (
    frequency === null ||
    frequency === undefined ||
    frequency === "" ||
    frequency === 0 ||
    frequency === "0"
  ) {
    return "-";
  }

  return CONTROL_FREQUENCY_LABELS[String(frequency)] || String(frequency);
}
