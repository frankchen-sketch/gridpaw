// 最小 ambient 声明：Cloudflare Workers / Pages Functions 运行时类型
// （本仓库未安装 @cloudflare/workers-types，只声明实际用到的面）
declare interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  exec(query: string): Promise<unknown>;
}
declare interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all(): Promise<{ results: unknown[]; success: boolean; meta: unknown }>;
  first(): Promise<unknown>;
  run(): Promise<D1Result>;
}
declare interface D1Result {
  results?: unknown[];
  success: boolean;
  meta: unknown;
}
type PagesFunction<E = unknown> = (context: { request: Request; env: E; params: Record<string, string | string[]> }) => Promise<Response>;
