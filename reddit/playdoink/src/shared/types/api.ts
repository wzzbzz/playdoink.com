export type InitResponse = {
  type: "init";
  postId: string;
  username: string;
  highest_streak: number;
  total_rounds?: number;
  average_streak?: number;
};

export type IncrementResponse = {
  type: "increment";
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: "decrement";
  postId: string;
  count: number;
};
