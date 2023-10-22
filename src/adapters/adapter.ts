export default interface Adapter {
  findByKey: (key: string) => Promise<string | undefined>;
  createKey: (key: string, userId: string) => Promise<string>;
  revokeKey: (key: string) => Promise<any>;
  checkKey: (key: string) => Promise<boolean>;

  devCommands?: {
    seed: () => void;
  };
}
