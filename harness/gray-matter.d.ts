declare module "gray-matter" {
  interface GrayMatterFile {
    content: string;
    data: Record<string, any>;
    isEmpty?: boolean;
    language: string;
    matter: string;
  }
  interface Options {
    engines?: Record<string, (input: string) => unknown>;
    delimiters?: string | [string, string];
    language?: string;
    excerpt?: boolean | ((file: GrayMatterFile) => string);
  }
  function matter(input: string | Buffer, options?: Options): GrayMatterFile;
  export = matter;
}
