/** One photograph in the Our Story section. */
export type StoryImageDTO = {
  /** Empty string means "nothing uploaded yet" — the section draws a placeholder. */
  url: string;
  alt: string;
};

/**
 * Plain JSON, no ObjectId and no Date, so it is safe to hand to a Client
 * Component. Mirrors ProductDTO's role for products.
 */
export type StoryDTO = {
  primary: StoryImageDTO;
  secondary: StoryImageDTO;
};
