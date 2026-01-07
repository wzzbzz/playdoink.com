export type InitResponse = {
  type: "init";
  postId: string;
  total_rounds: number;
  highest_streak: number;
  average_streak: number;
  username: string;
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
