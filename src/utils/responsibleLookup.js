import { API_URL } from "config";

const DIRECTORY_ID_KEYS = ["id", "idCollaborator", "idResponsible", "value"];
const DIRECTORY_NAME_KEYS = ["nome", "name", "fullName", "displayName", "label"];
const ITEM_ID_KEYS = ["idResponsible", "responsibleId", "id_responsible"];
const ITEM_NAME_KEYS = ["responsibleName", "responsible", "nameResponsible"];
const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const directoryCache = new Map();
const directoryPromiseCache = new Map();

const normalizeValue = (value) => String(value ?? "").trim();

const normalizeKey = (value) => normalizeValue(value).toLowerCase();

const isGuidLike = (value) => GUID_REGEX.test(normalizeValue(value));

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  return [value];
};

const pickFirstString = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

const pickFirstValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value != null && value !== "") {
      return value;
    }
  }

  return null;
};

const getDirectoryEntryName = (entry) =>
  pickFirstString(entry, DIRECTORY_NAME_KEYS);

const getDirectoryEntryId = (entry) => pickFirstValue(entry, DIRECTORY_ID_KEYS);

const buildResponsibleDirectoryLookup = (responsibles = []) => {
  const lookup = new Map();

  responsibles.forEach((entry) => {
    const id = getDirectoryEntryId(entry);
    const name = getDirectoryEntryName(entry);

    if (!id || !name) return;

    lookup.set(normalizeKey(id), name);
  });

  return lookup;
};

const resolveResponsibleNameFromItem = (item, lookup) => {
  const explicitName = pickFirstString(item, ITEM_NAME_KEYS);

  if (explicitName && !isGuidLike(explicitName)) {
    return explicitName;
  }

  const idValues = ITEM_ID_KEYS.flatMap((key) => toArray(item?.[key]));
  const resolvedNames = idValues
    .map((value) => {
      const normalized = normalizeValue(value);
      if (!normalized) return null;

      return lookup.get(normalizeKey(normalized)) || null;
    })
    .filter(Boolean);

  if (resolvedNames.length > 0) {
    return [...new Set(resolvedNames)].join(", ");
  }

  if (explicitName) {
    return explicitName;
  }

  return null;
};

export const fetchResponsiblesDirectory = async (token, fetchImpl = fetch) => {
  const cacheKey = token || "anonymous";

  if (directoryCache.has(cacheKey)) {
    return directoryCache.get(cacheKey);
  }

  if (directoryPromiseCache.has(cacheKey)) {
    return directoryPromiseCache.get(cacheKey);
  }

  const request = fetchImpl(`${API_URL}collaborators/responsibles`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Erro ao buscar diretorio de responsaveis");
      }

      const data = await response.json();
      const responsibles = Array.isArray(data) ? data : [];
      directoryCache.set(cacheKey, responsibles);
      return responsibles;
    })
    .finally(() => {
      directoryPromiseCache.delete(cacheKey);
    });

  directoryPromiseCache.set(cacheKey, request);
  return request;
};

export const enrichItemsWithResponsibleNames = async (
  items,
  token,
  fetchImpl = fetch,
) => {
  if (!Array.isArray(items) || items.length === 0) {
    return items;
  }

  try {
    const responsibles = await fetchResponsiblesDirectory(token, fetchImpl);
    const lookup = buildResponsibleDirectoryLookup(responsibles);

    return items.map((item) => {
      const responsibleName = resolveResponsibleNameFromItem(item, lookup);

      if (!responsibleName) {
        return item;
      }

      return {
        ...item,
        responsible: responsibleName,
        responsibleName,
      };
    });
  } catch (error) {
    console.error("Nao foi possivel resolver os nomes dos responsaveis.", error);
    return items;
  }
};
