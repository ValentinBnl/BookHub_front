export const mockToken = 'mock-jwt-token.e2e-testing';

export const mockAuthResponse = {
  token: mockToken,
  email: 'alice@example.com',
  role: 'USER',
};

export const mockCategories = ['Roman', 'Science-fiction', 'Histoire', 'Biographie', 'Policier'];

export const mockBookSummaries = [
  {
    id: 1,
    titre: 'Le Petit Prince',
    auteur: 'Antoine de Saint-Exupéry',
    urlCouverture: '',
    totalExemplaires: 3,
    exemplairesDisponibles: 2,
    categorie: 'Roman',
  },
  {
    id: 2,
    titre: 'Dune',
    auteur: 'Frank Herbert',
    urlCouverture: '',
    totalExemplaires: 2,
    exemplairesDisponibles: 0,
    categorie: 'Science-fiction',
  },
  {
    id: 3,
    titre: "L'Étranger",
    auteur: 'Albert Camus',
    urlCouverture: '',
    totalExemplaires: 1,
    exemplairesDisponibles: 1,
    categorie: 'Roman',
  },
];

export const mockBookPage = {
  content: mockBookSummaries,
  totalElements: mockBookSummaries.length,
  totalPages: 1,
  number: 0,
  size: 8,
};

export const mockMultiPageBookPage = {
  content: mockBookSummaries,
  totalElements: 20,
  totalPages: 3,
  number: 0,
  size: 8,
};

export const mockEmptyBookPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 8,
};

export const mockBookDetail = {
  id: 1,
  titre: 'Le Petit Prince',
  auteur: 'Antoine de Saint-Exupéry',
  isbn: '9782070612758',
  description:
    "Un pilote d'avion tombe en panne dans le désert du Sahara et rencontre un mystérieux petit prince venu d'une autre planète.",
  dateParution: '1943-04-06',
  nombrePages: 96,
  urlCouverture: '',
  totalExemplaires: 3,
  exemplairesDisponibles: 2,
  categorie: 'Roman',
};
