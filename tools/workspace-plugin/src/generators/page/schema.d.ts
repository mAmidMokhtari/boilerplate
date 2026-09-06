export type PageGeneratorSchema = {
  app: "web" | "admin";
  path: string;
  name: string;
  withLoading?: boolean;
  withError?: boolean;
};
