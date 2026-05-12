import { CategoryId } from "@/src/types";

export const SCHEMA_MAP = {
    date: ["date operation"],
    description: ["libelle simplifie"],
    category: ["categorie"],
    // For amount, if '-' is present => negative amount
    amount: ["credit", "debit"],
} as const;

// prettier-ignore
export const CATEGORY_MAP: Record<CategoryId, string[]> = {
    food:       ["alimentation", "restaurant", "supermarche", "hyper", "epicerie", "boulangerie", "boucherie"],
    transport:  ["transport", "carburant", "vehicule", "essence", "taxi", "uber", "train", "sncf", "peage"],
    housing:    ["logement", "maison", "energie", "loyer", "eau", "gaz", "electricite", "internet", "telephonie", "travaux"],
    entertainment:    ["loisirs", "vacances", "sport", "musique", "video", "jeux", "hotel", "bar", "cinema", "livre", "magazine"],
    health:     ["sante", "medical", "pharmacie", "consultation", "mutuelle", "assurance maladie"],
    shopping:   ["shopping", "services", "amazon", "cadeaux", "dons", "poste", "colis", "high-tech"],
    fees:       ["banque", "assurance", "frais bancaires", "juridique", "administratif"],
    income:     ["revenu", "rentree", "virement recu", "allocations", "salaire", "remboursement"],
    other:      [],
  };
