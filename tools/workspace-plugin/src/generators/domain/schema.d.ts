export type DomainGeneratorSchema = {
  name: string;
  audience?: "admin" | "customer";
  public?: boolean;
};
