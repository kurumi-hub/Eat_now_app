export type ReviewEligibleOrder = {
  orderId: string;
  code: string;
  completedAt: string;
  existingRating?: number;
  existingComment?: string;
};

export type CatalogReview = {
  id: string;
  customerName: string;
  initial: string;
  rating: number;
  content: string;
  createdAt: string;
};

export type FoodReviewData = {
  ratingAverage: number;
  ratingCount: number;
  reviews: CatalogReview[];
};
