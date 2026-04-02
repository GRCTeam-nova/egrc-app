const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined || value === "") {
    return [];
  }

  return [value];
};

export const SELECT_ALL_AUTOCOMPLETE_ID = "all";

export const getOptionId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "object") {
    return value.id ?? null;
  }

  return value;
};

export const getSelectedIdSet = (selectedValue) =>
  new Set(toArray(selectedValue).map(getOptionId).filter(Boolean));

export const dedupeOptionsById = (options = []) => {
  const seenIds = new Set();

  return options.filter((option) => {
    const optionId = getOptionId(option);

    if (!optionId) {
      return false;
    }

    const normalizedId = String(optionId);

    if (seenIds.has(normalizedId)) {
      return false;
    }

    seenIds.add(normalizedId);
    return true;
  });
};

export const findSelectedOption = (options = [], selectedValue) => {
  const selectedId = getOptionId(selectedValue);

  if (!selectedId) {
    return null;
  }

  return (
    options.find((option) => String(option.id) === String(selectedId)) || null
  );
};

export const findSelectedOptions = (options = [], selectedValue = []) => {
  const seenIds = new Set();

  return toArray(selectedValue)
    .map((value) => findSelectedOption(options, value))
    .filter((option) => {
      if (!option) {
        return false;
      }

      const normalizedId = String(option.id);

      if (seenIds.has(normalizedId)) {
        return false;
      }

      seenIds.add(normalizedId);
      return true;
    });
};

export const buildActiveOptionsWithSelected = (
  options = [],
  selectedValue = [],
  predicate = () => true,
) => {
  const selectedIds = getSelectedIdSet(selectedValue);

  return options.filter(
    (option) =>
      predicate(option) &&
      (option.active !== false || selectedIds.has(option.id)),
  );
};

export const areAllVisibleOptionsSelected = (
  visibleOptions = [],
  selectedValue = [],
) => {
  const selectedIds = getSelectedIdSet(selectedValue);

  return (
    visibleOptions.length > 0 &&
    visibleOptions.every((option) => selectedIds.has(option.id))
  );
};

export const withSelectAllOption = (
  options = [],
  label = "Selecionar todos",
) => [{ id: SELECT_ALL_AUTOCOMPLETE_ID, nome: label }, ...options];

export const getOptionDisplayLabel = (
  option,
  inactiveLabel = "Inativa",
) => {
  if (!option) {
    return "";
  }

  const baseLabel = option.nome || option.name || "";

  return option.active === false
    ? `${baseLabel} (${inactiveLabel})`
    : baseLabel;
};

export const buildInactiveSelectionHelperText = (
  selectedOptions = [],
  {
    singular = "Item selecionado est\u00e1 inativo. Voc\u00ea pode mant\u00ea-lo ou remov\u00ea-lo.",
    plural = "Alguns itens selecionados est\u00e3o inativos. Voc\u00ea pode mant\u00ea-los ou remov\u00ea-los.",
  } = {},
) => {
  const inactiveCount = selectedOptions.filter(
    (option) => option?.active === false,
  ).length;

  if (inactiveCount === 0) {
    return "";
  }

  return inactiveCount === 1 ? singular : plural;
};
