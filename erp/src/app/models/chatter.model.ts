/**
 * Modelo para posts del chatter
 */
export interface ChatterPost {
  id: number;
  entity_id: number;
  foreign_id: number;
  body: string;
  created_by: number;
  created_by_name: string;
  created_by_initials: string;
  created_at: string;
  updated_at?: string;
  mentions: ChatterMention[];
  can_edit: boolean;
  can_delete: boolean;
}

/**
 * Mención de usuario en un post
 */
export interface ChatterMention {
  user_id: number;
  user_name: string;
}

/**
 * Sugerencia de usuario para menciones
 */
export interface UserSuggestion {
  id: number;
  name: string;
  email: string;
  initials: string;
}

/**
 * DTO para crear un post
 */
export interface CreatePostDto {
  entity_id: number;
  foreign_id: number;
  body: string;
  mentions?: number[];
}

/**
 * DTO para actualizar un post
 */
export interface UpdatePostDto {
  body: string;
  mentions?: number[];
}

/**
 * Respuesta de la API para posts
 */
export interface ChatterPostsResponse {
  success: boolean;
  data: ChatterPost[];
  pagination: ChatterPagination;
  message?: string;
}

/**
 * Respuesta de la API para un post
 */
export interface ChatterPostResponse {
  success: boolean;
  data: ChatterPost;
  message?: string;
}

/**
 * Paginación del chatter
 */
export interface ChatterPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasMore: boolean;
}

/**
 * Respuesta de la API para búsqueda de usuarios
 */
export interface UserSuggestionsResponse {
  success: boolean;
  data: UserSuggestion[];
}

/**
 * Extrae las menciones de un texto
 * @param text Texto con menciones @usuario
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

/**
 * Formatea el texto reemplazando menciones con badges
 * @param text Texto con menciones
 * @param mentions Lista de menciones
 */
export function formatMentions(text: string, mentions: ChatterMention[]): string {
  let formattedText = text;
  mentions.forEach((mention) => {
    const regex = new RegExp(`@${mention.user_name}`, 'gi');
    formattedText = formattedText.replace(
      regex,
      `<span class="mention-badge">@${mention.user_name}</span>`
    );
  });
  return formattedText;
}
